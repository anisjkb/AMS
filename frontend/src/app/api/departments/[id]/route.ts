
// E:\Audit\AMS\frontend\src\app\api\departments\[id]\route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

async function parseBackendResponse(response: Response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = await getAccessToken();
  const { id } = await params;
  const body = await request.json();

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!API_URL) {
    return NextResponse.json(
      { message: "Frontend API URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await parseBackendResponse(response);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Department PATCH proxy failed:", error);

    return NextResponse.json(
      {
        message:
          "Backend server unreachable. Please start the backend server and try again.",
      },
      { status: 503 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = await getAccessToken();
  const { id } = await params;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!API_URL) {
    return NextResponse.json(
      { message: "Frontend API URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/departments/${id}/permanent`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await parseBackendResponse(response);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Department DELETE proxy failed:", error);

    return NextResponse.json(
      {
        message:
          "Backend server unreachable. Please start the backend server and try again.",
      },
      { status: 503 }
    );
  }
}