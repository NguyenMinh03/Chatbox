import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import {
  getDesktopPermission,
  isDesktopNotificationSupported,
  requestDesktopPermission,
} from "@/lib/notifications";
import type { NotificationPreferences } from "@/types/user";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  directMessages: true,
  groupMessages: true,
  friendRequests: true,
  sound: true,
  desktopAlerts: false,
};

const NotificationSettingsDialog = () => {
  const { user } = useAuthStore();
  const { updateNotificationPreferences } = useUserStore();
  const [savingKey, setSavingKey] = useState<keyof NotificationPreferences | null>(null);

  const prefs = user?.notificationPreferences ?? DEFAULT_PREFERENCES;

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    setSavingKey(key);
    await updateNotificationPreferences({ [key]: value });
    setSavingKey(null);
  };

  const handleDesktopToggle = async (value: boolean) => {
    if (!value) {
      await handleToggle("desktopAlerts", false);
      return;
    }

    if (!isDesktopNotificationSupported()) {
      toast.error("Your browser does not support desktop notifications");
      return;
    }

    const permission = await requestDesktopPermission();

    if (permission !== "granted") {
      toast.error(
        "Desktop notifications are blocked. Allow them for this site in your browser settings."
      );
      return;
    }

    await handleToggle("desktopAlerts", true);
  };

  const desktopPermission = getDesktopPermission();

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-start glass-light border-border/30 hover:text-info"
          />
        }
      >
        <Bell className="h-4 w-4 mr-2" />
        Notification Settings
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Choose what you get notified about and how.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label
                htmlFor="notif-direct"
                className="text-sm font-medium"
              >
                Direct Messages
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified when a friend messages you
              </p>
            </div>
            <Switch
              id="notif-direct"
              checked={prefs.directMessages}
              disabled={savingKey === "directMessages"}
              onCheckedChange={(value) => handleToggle("directMessages", value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label
                htmlFor="notif-group"
                className="text-sm font-medium"
              >
                Group Messages
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified for new messages in your group chats
              </p>
            </div>
            <Switch
              id="notif-group"
              checked={prefs.groupMessages}
              disabled={savingKey === "groupMessages"}
              onCheckedChange={(value) => handleToggle("groupMessages", value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label
                htmlFor="notif-friend"
                className="text-sm font-medium"
              >
                Friend Requests
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified when someone sends you a friend request
              </p>
            </div>
            <Switch
              id="notif-friend"
              checked={prefs.friendRequests}
              disabled={savingKey === "friendRequests"}
              onCheckedChange={(value) => handleToggle("friendRequests", value)}
            />
          </div>

          <div className="pt-4 border-t border-border/30 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label
                  htmlFor="notif-sound"
                  className="text-sm font-medium"
                >
                  Sound Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Play a sound for the alerts above
                </p>
              </div>
              <Switch
                id="notif-sound"
                checked={prefs.sound}
                disabled={savingKey === "sound"}
                onCheckedChange={(value) => handleToggle("sound", value)}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label
                  htmlFor="notif-desktop"
                  className="text-sm font-medium"
                >
                  Desktop Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  {desktopPermission === "denied"
                    ? "Blocked in your browser settings"
                    : "Show a popup while Chatbox is in the background"}
                </p>
              </div>
              <Switch
                id="notif-desktop"
                checked={prefs.desktopAlerts}
                disabled={savingKey === "desktopAlerts" || desktopPermission === "denied"}
                onCheckedChange={handleDesktopToggle}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettingsDialog;
