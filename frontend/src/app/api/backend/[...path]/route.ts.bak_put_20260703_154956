// E:\Audit\AMS\frontend\src\app\api\backend\[...path]\route.ts

import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxyRequest(request: NextRequest, context: RouteContext) {
  if (!BACKEND_API_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured." },
      { status: 500 }
    );
  }

  const { path } = await context.params;
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Unauthorized. Please login again." },
      { status: 401 }
    );
  }

  const targetUrl = `${BACKEND_API_URL}/${path.join("/")}${request.nextUrl.search}`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
  };

  const contentType = request.headers.get("content-type");

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const method = request.method.toUpperCase();

  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.text();

  const backendResponse = await fetch(targetUrl, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  const responseContentType = backendResponse.headers.get("content-type");

  if (responseContentType?.includes("application/json")) {
    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  }

  const text = await backendResponse.text();

  return new NextResponse(text, {
    status: backendResponse.status,
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}