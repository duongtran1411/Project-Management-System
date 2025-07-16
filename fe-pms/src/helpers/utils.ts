export const getInitials = (name: string): string => {
  if (!name || typeof name !== "string") return "U";

  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return "just now";

  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) return "just now";

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

export const groupNotificationsByDate = <T extends { createdAt: string }>(
  notifications: T[]
): { [key: string]: T[] } => {
  const groups: { [key: string]: T[] } = {};

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey = "Older";
    if (date.toDateString() === today.toDateString()) {
      groupKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = "Yesterday";
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });

  return groups;
};
export const getCurrentUser = (): {
  userId: string;
  [key: string]: any;
} | null => {
  if (typeof window === "undefined") return null;

  try {
    const currentUser = localStorage.getItem("currentUser");
    return currentUser ? JSON.parse(currentUser) : null;
  } catch (error) {
    console.error("Error parsing current user:", error);
    return null;
  }
};

export const getCurrentUserId = (): string | null => {
  const user = getCurrentUser();
  return user?.userId || null;
};
export const getUserAvatar = (user: any): string => {
  if (!user) return "U";

  if (typeof user === "object" && user.avatar) {
    return user.avatar;
  }

  if (typeof user === "object" && user.fullname) {
    return getInitials(user.fullname);
  }

  if (typeof user === "string") {
    return getInitials(user);
  }

  return "U";
};
