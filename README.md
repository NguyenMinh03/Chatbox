# Chatbox

A full-stack real-time chat app. Add friends by username, then chat one-to-one or in groups, with live delivery, read receipts, unread counters, online presence and desktop/sound notifications.

**Stack:** React 19 · TypeScript · Vite · Zustand · Tailwind CSS + shadcn/ui — Node.js · Express 5 · MongoDB (Mongoose) · Socket.IO · JWT · Cloudinary

> For how the pieces fit together (data model, API, socket events, auth flow), see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Features

- **Accounts:** sign up / sign in, with a short-lived access token and a refresh token in an httpOnly cookie, so sessions survive page reloads
- **Friends:** search by username, send requests with an optional message, accept or decline them, and get notified of new requests in real time
- **Direct messages and group chats:** you can only message or group with friends; history loads as you scroll back
- **Real-time:** new messages, read receipts ("seen by"), new conversations, deleted conversations and online status are all pushed over WebSockets
- **Unread counts** for each conversation and user
- **Profile:** edit display name, username, email, phone and bio; upload an avatar (Cloudinary); change your password (this signs you out on every device); delete your account
- **Notifications:** turn alerts on or off for direct messages, group messages and friend requests separately, with an optional sound and desktop pop-ups
- **Report a user** for spam, harassment, and similar
- **Light and dark theme**, plus an emoji picker
- **API docs:** Swagger UI at `/api-docs`

## Project structure

```
Chatbox/
├── backend/    # Express + Socket.IO API  (src/server.js)
├── frontend/   # React + Vite SPA          (src/main.tsx)
├── ARCHITECTURE.md
└── README.md
```

## Getting started

### Prerequisites

- Node.js (a recent LTS) and npm
- A MongoDB database (local or MongoDB Atlas)
- A Cloudinary account (for avatar uploads)

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5001
MONGODB_CONNECTION_STRING=mongodb+srv://<user>:<password>@<cluster>/<db>
ACCESS_TOKEN_SECRET=<a long random string>
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your api key>
CLOUDINARY_API_SECRET=<your api secret>
```

`CLIENT_URL` must match the exact origin the frontend runs on, because both CORS and Socket.IO only accept that origin. `http://localhost:5173` is Vite's default.

```bash
npm run dev      # development, auto-reload with nodemon
npm start        # production
```

The API runs at `http://localhost:5001/api` and the Swagger docs at `http://localhost:5001/api-docs`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.development`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001/
```

For production builds, set the same two variables in `frontend/.env.production` to your deployed backend URL.

```bash
npm run dev      # start the Vite dev server
npm run build    # type-check and build to dist/
npm run preview  # preview the production build
npm run lint     # ESLint
```

Open the URL Vite prints (usually `http://localhost:5173`), create two accounts (for example, in a normal window and a private window), add each other as friends, and start chatting.

## Scripts

| Location | Command | What it does |
|---|---|---|
| `backend/` | `npm run dev` | Start the API with nodemon |
| `backend/` | `npm start` | Start the API with node |
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run build` | `tsc -b && vite build` |
| `frontend/` | `npm run preview` | Serve the built app locally |
| `frontend/` | `npm run lint` | Run ESLint |

There are no automated tests yet.

## Deployment notes

- The refresh-token cookie is set with `secure: true` and `sameSite: "none"`, so in production the backend **must be served over HTTPS**. Cross-origin frontend and backend hosting is supported.
- REST and WebSocket traffic share one port. If there's a reverse proxy in front, make sure it allows WebSocket upgrades.
- Online presence is kept in server memory, so run a **single backend instance** (or add a shared Socket.IO adapter such as Redis before scaling out).

## Roadmap / known gaps

- Image messages (the schema supports `imgUrl`, but sending isn't wired up yet)
- Clean up a deleted user's messages and conversations
- Moderation view for user reports
- Partial username search
- Automated tests

See the "Known limitations" section of [ARCHITECTURE.md](./ARCHITECTURE.md) for details.
