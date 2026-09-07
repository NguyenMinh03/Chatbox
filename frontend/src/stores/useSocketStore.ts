import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";
import { useFriendStore } from "./useFriendStore";
import { notify } from "@/lib/notifications";

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;

    if (existingSocket) return; 

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("Connected socket");
    });
    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });
     // online users
    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // new message
    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      useChatStore.getState().addMessage(message);

      const lastMessage = {
        _id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        createdAt: conversation.lastMessage.createdAt,
        sender: {
          _id: conversation.lastMessage.senderId,
          displayName: "",
          avatarUrl: null,
        },
      };

      const updatedConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      };

      if (useChatStore.getState().activeConversationId === message.conversationId) {
        useChatStore.getState().markAsSeen();
      }

      useChatStore.getState().updateConversation(updatedConversation);

      const { user } = useAuthStore.getState();
      const isOwnMessage = user?._id === message.senderId;

      if (!isOwnMessage) {
        const convoInfo = useChatStore
          .getState()
          .conversations.find((c) => c._id === conversation._id);
        const isGroup = convoInfo?.type === "group";
        const senderName =
          convoInfo?.participants.find((p) => p._id === message.senderId)?.displayName ??
          "Someone";

        notify({
          category: isGroup ? "groupMessages" : "directMessages",
          title: isGroup
            ? `${convoInfo?.group?.name ?? "Group chat"}`
            : `New message from ${senderName}`,
          body: isGroup
            ? `${senderName}: ${message.content ?? "sent an image"}`
            : message.content ?? "sent an image",
        });
      }
    });

    // new friend request
    socket.on("new-friend-request", (request) => {
      useFriendStore.getState().addReceivedRequest(request);

      notify({
        category: "friendRequests",
        title: "New friend request",
        body: `${request.from?.displayName ?? "Someone"} sent you a friend request`,
      });
    });

    // read message
    socket.on("read-message", ({ conversation, lastMessage }) => {
      const updated = {
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      };

      useChatStore.getState().updateConversation(updated);
    });

    // new group chat
    socket.on("new-group", (conversation) => {
      useChatStore.getState().addConvo(conversation);
      socket.emit("join-conversation", conversation._id);
    });

    // conversation deleted
    socket.on("conversation-deleted", ({ conversationId }) => {
      useChatStore.getState().removeConvo(conversationId);
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));