import {create} from "zustand";
import { persist } from "zustand/middleware";
import type { ChatState } from "@/types/store";
export const useChatStore = create<ChatState>() (
persist((set,get) => ({
    conversations: [],
    messages: {},
    activeConversationId: null,
    loading: false,
    setActiveConversationId: (id) => set({activeConversationId: id}),
    reset: () => set({conversations: [], messages: {}, activeConversationId: null, loading: false})
}),
{
    name: "chat-storage",
    partialize: (state) => ({conversations: state.conversations})
}))