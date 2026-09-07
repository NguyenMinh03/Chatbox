import { useAuthStore } from "@/stores/useAuthStore";

export type NotificationCategory = "directMessages" | "groupMessages" | "friendRequests";

/**
 * Whether the browser supports the desktop Notification API at all.
 */
export const isDesktopNotificationSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

/**
 * Current permission state, or "unsupported" if the API doesn't exist.
 */
export const getDesktopPermission = (): NotificationPermission | "unsupported" => {
  if (!isDesktopNotificationSupported()) return "unsupported";
  return Notification.permission;
};

/**
 * Ask the browser for permission to show desktop notifications.
 * Must be called from a user gesture (e.g. a switch toggle click).
 */
export const requestDesktopPermission = async (): Promise<NotificationPermission> => {
  if (!isDesktopNotificationSupported()) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
};

/**
 * Plays a short, synthesized two-tone chime. No audio asset needed.
 */
export const playNotificationSound = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const playTone = (frequency: number, startOffset: number, duration: number) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + startOffset);

      gain.gain.setValueAtTime(0, now + startOffset);
      gain.gain.linearRampToValueAtTime(0.15, now + startOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(now + startOffset);
      oscillator.stop(now + startOffset + duration);
    };

    playTone(740, 0, 0.15);
    playTone(988, 0.12, 0.18);

    setTimeout(() => ctx.close(), 500);
  } catch (error) {
    console.error("Fail when playNotificationSound", error);
  }
};

const showDesktopNotification = (title: string, body: string) => {
  if (getDesktopPermission() !== "granted") return;

  try {
    new Notification(title, {
      body,
      icon: "/logo.svg",
    });
  } catch (error) {
    console.error("Fail when showDesktopNotification", error);
  }
};

/**
 * Central entry point: checks the current user's saved preferences and fires
 * whichever alerts (sound / desktop popup) are enabled for this category.
 */
export const notify = ({
  category,
  title,
  body,
}: {
  category: NotificationCategory;
  title: string;
  body: string;
}) => {
  const { user } = useAuthStore.getState();
  const prefs = user?.notificationPreferences;

  if (!prefs || prefs[category] === false) return;

  if (prefs.sound) {
    playNotificationSound();
  }

  const appIsHidden = document.hidden || !document.hasFocus();

  if (prefs.desktopAlerts && appIsHidden) {
    showDesktopNotification(title, body);
  }
};
