import { User } from "../components/types";

export const useNotifications = (earconOption: string = 'Both') => {

  const playNotificationSound = () => {
    console.log("playing notification");
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    // pitch
    oscillator.frequency.setValueAtTime(580, audioContext.currentTime);

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // duration
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.25);
  };

  const playNotificationFile = () => {
    console.log("playing notification from file");
    try {
      const audio = new Audio('/notification.wav'); // might not be accessible nonlocally
      audio.play().catch(error => {
        console.error("Failed to play notification sound:", error);
      });
    } catch (error) {
      console.error("Error loading notification sound:", error);
    }
  };

  const screenReaderMessage = (message: string) => {
    console.log("playing screen reader message", message);
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "assertive");
    announcement.setAttribute("role", "alert");
    announcement.classList.add("screen-reader-text");
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 3000);
  };

  // both visual and screen reader notification
  const notifyUser = async (message: { action: string; content: string }) => {
    const infoNotification = `${message.action}`;
    //await miro.board.notifications.showInfo(infoNotification);
    screenReaderMessage(infoNotification);
  };

  const onUserJoin = async (user: User) => {
    const joinNotification = `${user.name} has joined`;
    //await miro.board.notifications.showInfo(joinNotification);
    screenReaderMessage(joinNotification);
  }

  const onUserLeave = async (user: User) => {
    const leftNotification = `${user.name} has left`;
    //await miro.board.notifications.showInfo(leftNotification);
    screenReaderMessage(leftNotification);
  }

  return { notifyUser, onUserJoin, onUserLeave, playNotificationSound, playNotificationFile, screenReaderMessage };
};
