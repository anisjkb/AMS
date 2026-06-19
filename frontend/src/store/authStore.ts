import type { CurrentUser } from "@/types/auth";

export const setTokens = (
  accessToken: string,
  refreshToken: string
) => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
};

export const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

export const getRefreshToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
};

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const setCurrentUser = (user: CurrentUser) => {
  localStorage.setItem("current_user", JSON.stringify(user));
};

export const getCurrentUser = (): CurrentUser | null => {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("current_user");

  if (!user) return null;

  return JSON.parse(user);
};

export const clearCurrentUser = () => {
  localStorage.removeItem("current_user");
};