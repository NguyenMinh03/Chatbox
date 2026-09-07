export interface NotificationPreferences {
  directMessages: boolean;
  groupMessages: boolean;
  friendRequests: boolean;
  sound: boolean;
  desktopAlerts: boolean;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  notificationPreferences?: NotificationPreferences;
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateProfilePayload = Partial<
  Pick<User, "displayName" | "username" | "email" | "phone" | "bio">
>;

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type UpdateNotificationPreferencesPayload = Partial<NotificationPreferences>;
export interface Friend {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface FriendRequest {
  _id: string;
  from?: {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  to?: {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  message: string;
  createdAt: string;
  updatedAt: string;
}