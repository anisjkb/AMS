import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type BackendLoginResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: unknown;
  message?: string;
  detail?: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!API_URL) {
      return NextResponse.json(
        {
          message: "Frontend API URL is not configured.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = (await response
      .json()
      .catch(() => ({}))) as BackendLoginResponse;

    if (!response.ok) {
      let message = data.detail || data.message || "Login failed.";

      if (response.status === 401) {
        message = "Invalid user ID or password.";
      }

      if (response.status === 403) {
        message = data.detail || data.message || "You are not allowed to login.";
      }

      return NextResponse.json(
        {
          message,
        },
        { status: response.status }
      );
    }

    if (!data.access_token || !data.refresh_token) {
      return NextResponse.json(
        {
          message: "Login succeeded but token was not received from server.",
        },
        { status: 502 }
      );
    }

    const res = NextResponse.json(
      {
        message: "Login successful.",
        user: data.user ?? null,
      },
      { status: 200 }
    );

    res.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    res.cookies.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login API proxy failed:", error);

    return NextResponse.json(
      {
        message:
          "Server unreachable. Please start the backend server and try again.",
      },
      { status: 503 }
    );
  }
}