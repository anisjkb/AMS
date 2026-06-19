type LoginPayload = {
  user_id: string;
  password: string;
};

type LoginResponse = {
  message?: string;
  user?: unknown;
};

type ErrorResponse = {
  message?: string;
  detail?: string;
};

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as LoginResponse &
    ErrorResponse;

  if (!response.ok) {
    throw new Error(
      data.message || data.detail || "Login failed. Please try again."
    );
  }

  return data;
};

export const logout = async (): Promise<void> => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  const data = (await response.json().catch(() => ({}))) as ErrorResponse;

  if (!response.ok) {
    throw new Error(data.message || data.detail || "Logout failed.");
  }
};