import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: "Invalid user ID or password" },
      { status: 401 }
    );
  }

  const data = await response.json();

  const res = NextResponse.json({
    message: "Login successful",
  });

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
}