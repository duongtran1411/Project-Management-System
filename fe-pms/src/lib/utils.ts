import { Constants } from "@/lib/constants";

export const logout = () => {
  localStorage.removeItem(Constants.API_TOKEN_KEY);
  localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);
  const currrentPath = window.location.pathname;
  if (currrentPath.startsWith("/authentication/login")) return;

  window.location.href = "/";
};

export const formatDate = (date: string) => {
  const isoString: string = date;
  const dateObj: Date = new Date(isoString);

  const formattedDate: string = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
  }).format(dateObj);

  return formattedDate;
};

export const formatDateTime = (date: string) => {
  const dateObj = new Date(date);
  const formatted = dateObj.toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return formatted;
};

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const comletePercentage = (
  totalTimeSpent: number,
  totalRemainTime: number
) => {
  return (totalTimeSpent / (totalTimeSpent + totalRemainTime)) * 100;
};
