import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { verifyDriverToken } from "./driver";

export async function driverAuthMiddleware(request: NextRequest) {
  // Check if this is a driver route
  if (!request.nextUrl.pathname.startsWith("/driver")) {
    return NextResponse.next();
  }

  // Allow access to login page
  if (request.nextUrl.pathname === "/driver/login") {
    return NextResponse.next();
  }

  // Check for driver token
  const token = request.cookies.get("driver_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/driver/login", request.url));
  }

  const payload = verifyDriverToken(token);
  if (!payload) {
    // Invalid token, clear cookie and redirect
    const response = NextResponse.redirect(new URL("/driver/login", request.url));
    response.cookies.delete("driver_token");
    return response;
  }

  return NextResponse.next();
}

export async function adminAuthMiddleware(request: NextRequest) {
  // Check if this is a dashboard route
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Check Clerk authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

