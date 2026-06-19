import type { NavigationGroup } from "@/types/navigation";

export const getMyNavigation = async (): Promise<NavigationGroup[]> => {
  const response = await fetch("/api/me/navigation", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load navigation");
  }

  return response.json();
};