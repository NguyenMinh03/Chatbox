# Chatbox — Architecture

Chatbox is a real-time chat application: users sign up, add each other as friends, and talk in direct (1:1) or group conversations. It is a two-part monorepo:

| Part | Stack | Entry point |
|---|---|---|
| `backend/` | Node.js (ES modules), Express 5, Mongoose 9 (MongoDB), Socket.IO 4, JWT, bcrypt, Multer + Cloudinary | `backend/src/server.js` |
| `frontend/` | React 19 + TypeScript, Vite 8, React Router 7, Zustand 5, Axios, socket.io-client, Tailwind CSS 4 + shadcn/ui, react-hook-form + zod | `frontend/src/main.tsx` |

```
┌──────────────────────────── Browser (React SPA) ──────────────────────────────────┐
│  pages / components  ──►  Zustand stores  ──►  services  ──►  lib/axios.ts    │──REST /api/*──┐
│                                  ▲                                            │               │
│                                  └──── useSocketStore (socket.io-client) ◄────│──WebSocket────┤
└───────────────────────────────────────────────────────────────────────────────┘               │
                                                                                                ▼
┌──────────────────────────── Node.js server (single process) ─────────────────────────────────────┐
│  http.Server ─┬─ Express app: json · cookieParser · cors · /api-docs · routes → controllers      │
│               └─ Socket.IO server: socketAuthMiddleware → rooms (per user, per conversation)     │
│  controllers ── emit events via `io` ──►  Socket.IO                                              │
│  controllers ── Mongoose models ──►  MongoDB          uploadMiddleware ──►  Cloudinary (avatars) │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Repository layout

```
Chatbox/
├── CLAUDE.md                 # notes for Claude Code (partly outdated)
├── ARCHITECTURE.md           # this file
├── backend/
│   ├── .env                  # secrets (git-ignored)
│   └── src/
│       ├── server.js         # Express setup, middleware order, route mounting, DB connect + listen
│       ├── swagger.json      # OpenAPI doc served at /api-docs
│       ├── libs/db.js        # mongoose.connect()
│       ├── socket/index.js   # creates express app + http server + Socket.IO server (shared singletons)
│       ├── middlewares/      # auth (REST), socket auth, friendship/membership guards, upload
│       ├── routes/           # one router per resource
│       ├── controllers/      # request handlers (business logic lives here)
│       ├── models/           # Mongoose schemas
│       └── utils/messageHelper.js
└── frontend/
    ├── .env.development / .env.production   # VITE_API_URL, VITE_SOCKET_URL
    └── src/
        ├── main.tsx, App.tsx # bootstrap, router, theme + socket lifecycle
        ├── pages/            # SignInPage, SignUpPage, ChatAppPage
        ├── components/       # feature folders (auth, chat, sidebar, profile, friendRequest, …) + ui/ (shadcn)
        ├── stores/           # Zustand stores — app state + side effects
        ├── services/         # thin Axios wrappers, one per backend resource
        ├── lib/              # axios instance, notifications, utils
        ├── types/            # shared TS types (chat, user, store, report)
        └── hooks/            # use-mobile
```

---

## 2. Backend

### 2.1 Process bootstrap (`server.js`)

`socket/index.js` creates the Express `app`, wraps it in an `http.Server`, and attaches the Socket.IO server `io`. `server.js` imports these singletons, so **REST and WebSocket share one port** (`PORT`, default 5001).

Middleware order matters:

1. `express.json()`, `cookieParser()`, `cors({ origin: CLIENT_URL, credentials: true })`
2. Cloudinary is configured from env vars
3. `GET /api-docs` — Swagger UI (public)
4. `/api/auth` — **public** routes
5. `app.use(protectedRoute)` — everything mounted after this line requires a valid access token
6. `/api/users`, `/api/friends`, `/api/messages`, `/api/conversations`, `/api/reports`

The server only starts listening after `connectDB()` succeeds; a failed connection exits the process.

### 2.2 Layering

```
route  →  (guard middleware)  →  controller  →  Mongoose model
                                     └──────→  io.to(room).emit(...)   (real-time fan-out)
```

There is no separate service layer: controllers hold the business logic and import `io` directly to push events after a successful write. Shared message logic is in `utils/messageHelper.js`.

### 2.3 Data model (MongoDB)

| Model | Key fields | Notes |
|---|---|---|
| **User** | `username` (unique, lowercase), `email` (unique), `hashedPassword`, `displayName`, `avatarUrl`, `avatarId`, `bio`, `phone`, `notificationPreferences{directMessages, groupMessages, friendRequests, sound, desktopAlerts}` | `hashedPassword` is stripped (`select('-hashedPassword')`) whenever a user is loaded for a request |
| **Session** | `userId`, `refreshToken` (unique), `expiresAt` | TTL index on `expiresAt` — MongoDB deletes expired sessions automatically |
| **Friend** | `userA`, `userB` | Pair is **always stored sorted** (`userA < userB`, enforced by a pre-save hook and by `pair()` helpers); unique index on `{userA, userB}` makes friendship symmetric and duplicate-free |
| **FriendRequest** | `from`, `to`, `message` (≤300) | Unique on `{from, to}`; deleted on accept/decline |
| **Conversation** | `type: direct\|group`, `participants[{userId, joinedAt}]`, `group{name, createdBy}`, `lastMessage{_id, content, senderId, createdAt}`, `lastMessageAt`, `seenBy[]`, `unreadCounts: Map<userId, number>` | Denormalises the last message and per-user unread counters so the sidebar list needs a single query |
| **Message** | `conversationId`, `senderId`, `content`, `imgUrl` | Compound index `{conversationId, createdAt: -1}` supports cursor pagination |
| **Report** | `reporter`, `reportedUser`, `reason` (enum), `details`, `status: pending\|reviewed\|dismissed` | Write-only from the app; no moderation UI yet |

```
User 1───* Session
User *───* User          (via Friend, sorted pair)
User 1───* FriendRequest (from / to)
Conversation *───* User  (participants)
Conversation 1───* Message
User 1───* Report (reporter / reportedUser)
```

### 2.4 REST API

All paths are prefixed with `/api`. Everything except `/auth/*` requires `Authorization: Bearer <accessToken>`.

| Resource | Method & path | Guard | Purpose |
|---|---|---|---|
| auth | `POST /auth/signup` | – | Create user (bcrypt hash, cost 10) |
| | `POST /auth/signin` | – | Returns access token in body, sets `refreshToken` cookie |
| | `POST /auth/signout` | – | Deletes session, clears cookie |
| | `POST /auth/refresh` | cookie | Issues a new access token |
| users | `GET /users/me` | auth | Current user |
| | `PATCH /users/me` | auth | Update profile (checks username/email clashes) |
| | `DELETE /users/me` | auth | Delete account (password required) |
| | `PATCH /users/password` | auth | Change password, revokes **all** sessions |
| | `PATCH /users/notification-preferences` | auth | Update notification toggles |
| | `POST /users/uploadAvatar` | auth + multer (1 MB, memory) | Stream to Cloudinary `Chatbox/avatars`, 200×200 crop |
| | `GET /users/search?username=` | auth | Exact-match lookup |
| friends | `GET /friends` | auth | Friend list |
| | `GET /friends/requests` | auth | `{ sent, received }` |
| | `POST /friends/requests` | auth | Send request (emits `new-friend-request`) |
| | `POST /friends/requests/:id/accept` · `/decline` | auth, recipient only | Resolve request |
| conversations | `GET /conversations` | auth | User's conversations, newest first, participants populated |
| | `POST /conversations` | auth + `checkFriendship` | Create direct (idempotent) or group conversation (emits `new-group`) |
| | `GET /conversations/:id/messages?limit&cursor` | auth | Cursor-paginated history |
| | `PATCH /conversations/:id/seen` | auth | Mark as seen (emits `read-message`) |
| | `DELETE /conversations/:id` | auth, participant only | Delete conversation + messages (emits `conversation-deleted`) |
| messages | `POST /messages/direct` | auth + `checkFriendship` | Send DM; creates the conversation if missing |
| | `POST /messages/group` | auth + `checkGroupMembership` | Send to group |
| reports | `POST /reports` | auth | Report another user |

The live OpenAPI description is served at `GET /api-docs` from `src/swagger.json`.

### 2.5 Guard middlewares

- **`protectedRoute`** — verifies the JWT, loads the user, sets `req.user`. Missing token → `401`; invalid/expired token → **`403`** (the frontend relies on this code to trigger a refresh).
- **`checkFriendship`** — for `recipientId` (DM) or every id in `memberIds` (group creation), verifies a `Friend` row exists. You can only message or group with friends.
- **`checkGroupMembership`** — loads the conversation from `req.body.conversationId`, checks membership, attaches it as `req.conversation`.
- **`socketAuthMiddleware`** — same JWT check for the WebSocket handshake (`socket.handshake.auth.token`), sets `socket.user`.

### 2.6 Real-time layer (Socket.IO)

**Rooms.** On connection each socket joins:
- a **personal room** named after the user's id — for events addressed to one user (friend requests, new conversations);
- **one room per conversation** the user belongs to (looked up via `getUserConversationsForSocketIO`). Clients emit `join-conversation` to join rooms for conversations created after they connected.

**Presence.** An in-memory `Map<userId, socketId>` tracks online users; every connect/disconnect broadcasts the full list as `online-users`. Being in-process, this works for one server instance only, and the last-connected tab wins for users with multiple tabs.

**Events (server → client)**

| Event | Room | Emitted by | Payload |
|---|---|---|---|
| `online-users` | all | connect / disconnect | `userId[]` |
| `new-message` | conversation | `sendDirectMessage`, `sendGroupMessage` | `{ message, conversation{_id, lastMessage, lastMessageAt}, unreadCounts }` |
| `read-message` | conversation | `markAsSeen` | `{ conversation, lastMessage }` |
| `new-group` | each member's personal room | `createConversation` | formatted conversation |
| `new-friend-request` | recipient's personal room | `sendFriendRequest` | request with populated `from` |
| `conversation-deleted` | conversation | `deleteConversation` | `{ conversationId }` |

**Client → server:** `join-conversation(conversationId)`.

All writes go through REST; the socket is a **push-only notification channel**. This keeps validation and persistence in one place (the controllers) and lets the HTTP response confirm the write while the socket fans it out to everyone else.

### 2.7 Message write path

`messageHelper.updateConversationAfterCreateMessage` runs after every new `Message`:
- sets `lastMessage` / `lastMessageAt`,
- clears `seenBy`,
- sets the sender's `unreadCounts` to 0 and increments everyone else's.

The conversation is saved, then `emitNewMessage` broadcasts to the conversation room. `markAsSeen` does the reverse: `$addToSet` the reader into `seenBy` and zero their unread count (skipped if the reader sent the last message).

---

## 3. Authentication

Two-token scheme:

| Token | Format | Lifetime | Stored where |
|---|---|---|---|
| Access token | JWT `{ userId }` signed with `ACCESS_TOKEN_SECRET` | 30 min | Frontend memory only (Zustand; deliberately **not** persisted) |
| Refresh token | 64 random bytes (hex) | 14 days | `httpOnly`, `secure`, `sameSite=none` cookie + `Session` document |

```
Sign in ──► POST /auth/signin ──► accessToken (body) + refreshToken (cookie) + Session row
Request ──► Authorization: Bearer <access>          (axios request interceptor)
Expired ──► 403 ──► axios response interceptor ──► POST /auth/refresh (cookie) ──► retry (max 4)
                                                       └── fails ──► clearState() → /signin
Page reload ──► ProtectedRoute: no access token in memory ──► refresh() ──► fetchMe()
Sign out / change password / delete account ──► Session row(s) deleted
```

Refresh tokens are opaque and server-side, so they can be revoked (sign-out removes one session; password change removes all). The `sameSite=none; secure` cookie lets the frontend and API run on different origins in production.

---

## 4. Frontend

### 4.1 Bootstrap and routing (`App.tsx`)

- Routes: `/signin`, `/signup` (public) and `/` → `ChatAppPage`, wrapped in `ProtectedRoute`.
- `ProtectedRoute` restores the session on load (refresh → fetchMe), shows a loading state, and redirects to `/signin` if no token can be obtained.
- `App` applies the theme (`dark` class on `<html>`) and **connects the socket whenever `accessToken` changes**. The cleanup disconnects first, so a refreshed token yields a fresh, authenticated socket.
- `sonner` `<Toaster>` provides toasts app-wide.

### 4.2 Layers

```
components (UI, react-hook-form + zod)
      │ call actions
      ▼
stores (Zustand)      ← single source of truth; also receives socket events
      │ call
      ▼
services (*.ts)       ← one function per endpoint, no state
      │
      ▼
lib/axios.ts          ← baseURL = VITE_API_URL, withCredentials, auth + refresh interceptors
```

Components never call Axios directly. Stores import each other through `getState()` when needed (e.g. the socket store updates the chat and friend stores).

### 4.3 Stores

| Store | Responsibility | Persisted (localStorage) |
|---|---|---|
| `useAuthStore` | access token, current user, signIn/signUp/signOut/refresh/fetchMe, `clearState()` (also resets chat store and clears storage) | `user` only |
| `useChatStore` | conversations, messages keyed by conversation id `{items, hasMore, nextCursor}`, active conversation, send/seen/create/delete | `conversations` only |
| `useSocketStore` | Socket.IO client instance, `onlineUsers`, all event handlers | – |
| `useFriendStore` | friends, sent/received requests, search, accept/decline | – |
| `useUserStore` | profile, avatar, password, notification prefs, delete account (writes results back into `useAuthStore.user`) | – |
| `useThemeStore` | dark mode | yes |

### 4.4 Message lifecycle on the client

1. User sends → `useChatStore.sendDirectMessage / sendGroupMessage` → REST call. The UI does **not** append optimistically.
2. Server emits `new-message` to the conversation room (the sender included).
3. `useSocketStore` handler → `addMessage` (deduplicated by `_id`; first loads history if the conversation hasn't been opened yet) → `updateConversation` (last message, unread counts) → `markAsSeen` if that conversation is open → `notify()` for messages from others.
4. History scrolling: `fetchMessages` asks for the page before `nextCursor` (`react-infinite-scroll-component`) and prepends the results. `nextCursor === null` means the start of history has been reached.

### 4.5 Notifications (`lib/notifications.ts`)

`notify({ category, title, body })` reads the user's `notificationPreferences`, plays a two-tone chime made with the Web Audio API (no audio file needed), and shows a desktop `Notification` only when the tab is hidden or unfocused and permission is granted.

### 4.6 UI

- Tailwind CSS 4 via `@tailwindcss/vite`; shadcn/ui primitives in `components/ui/` (Base UI under the hood); `lucide-react` icons; Geist font.
- `@` is an alias for `frontend/src` (see `vite.config.ts` / `tsconfig`).
- Main screen: `AppSidebar` (conversation lists, friend actions, user menu) + `ChatWindowLayout` (header, message body, input with emoji picker).

---

## 5. Configuration

**backend/.env**

| Variable | Purpose |
|---|---|
| `PORT` | HTTP + WebSocket port (default 5001) |
| `MONGODB_CONNECTION_STRING` | MongoDB URI |
| `ACCESS_TOKEN_SECRET` | JWT signing secret |
| `CLIENT_URL` | Allowed CORS origin for REST and Socket.IO |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Avatar uploads |

**frontend/.env.development / .env.production**

| Variable | Dev value |
|---|---|
| `VITE_API_URL` | `http://localhost:5001/api` |
| `VITE_SOCKET_URL` | `http://localhost:5001/` |

`.env` files are git-ignored; add `.env.example` files to document them.

## 6. Running locally

```bash
# backend
cd backend && npm install && npm run dev     # nodemon src/server.js
# frontend
cd frontend && npm install && npm run dev    # Vite dev server
npm run build | npm run lint | npm run preview   # frontend only
```

No automated tests are configured yet.

---

## 7. Known limitations and next steps

- **Image messages are not persisted.** `Message.imgUrl` exists and the client sends `imgUrl`, but the message controllers only save `content` (and reject requests where it is empty).
- **Account deletion leaves data behind.** Sessions, friendships and requests are removed, but the user's messages and conversation memberships are not.
- **Single-instance assumptions.** Presence lives in an in-process `Map`, and Socket.IO has no adapter (e.g. Redis), so you cannot scale horizontally yet.
- **Conversation index typo.** The schema indexes `participant.userId`, but the field is `participants.userId`, so the conversation-list query doesn't benefit from the index.
- **Refresh trigger.** The client refreshes only on `403`; a missing token returns `401` and is not retried. The `online-users` handler is also registered twice in `useSocketStore`.
- **User search** is an exact username match.
- **Reports** have no admin/moderation interface yet.
- `CLAUDE.md` still describes the project as "frontend not yet initialized, no models" and should be updated. `swagger.json` was last edited before the reports, profile and notification endpoints were added, so check it against the table in §2.4.
