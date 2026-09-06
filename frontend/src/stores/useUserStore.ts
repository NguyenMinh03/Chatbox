import { userService } from "@/services/userService";
import type { UserState } from "@/types/store";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { toast } from "sonner";
import { useChatStore } from "./useChatStore";

export const useUserStore = create<UserState>((set, get) => ({
  updateAvatarUrl: async (formData) => {
    try {
      const { user, setUser } = useAuthStore.getState();
      const data = await userService.uploadAvatar(formData);

      if (user) {
        setUser({
          ...user,
          avatarUrl: data.avatarUrl,
        });

        useChatStore.getState().fetchConversations();
      }
    } catch (error) {
      console.error("Fail when updateAvatarUrl", error);
      toast.error("Upload avatar Fail!");
    }
  },

  updateProfile: async (payload) => {
    try {
      const { user, setUser } = useAuthStore.getState();
      const updatedUser = await userService.updateProfile(payload);

      if (user) {
        setUser({ ...user, ...updatedUser });
      }

      toast.success("Profile updated!");
      return true;
    } catch (error) {
      console.error("Fail when updateProfile", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to update profile";
      toast.error(message);
      return false;
    }
  },

  changePassword: async (payload) => {
    try {
      await userService.changePassword(payload);
      toast.success("Password changed successfully!");
      return true;
    } catch (error) {
      console.error("Fail when changePassword", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to change password";
      toast.error(message);
      return false;
    }
  },
}));