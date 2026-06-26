export type CurrentUser = {
  id: number;
  user_id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser?: boolean;
};

export async function getCurrentUser() {
  const response = await fetch("/api/backend/users/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load current user.");
  }

  return (await response.json()) as CurrentUser;
}
