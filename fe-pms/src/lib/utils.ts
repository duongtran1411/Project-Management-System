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
