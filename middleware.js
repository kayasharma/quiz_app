import { NextResponse } from "next/server";

export function middleware(request) {
  const origin = request.headers.get("origin");

  // Allow specific origins (e.g., your production URL and localhost for development)
  const allowedOrigins = [
    " https://quiz-app-six-teal-65.vercel.app",
    "http://localhost:3000",
  ];

  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  const response = NextResponse.next();

  // Set CORS headers
  response.headers.set("Access-Control-Allow-Origin", isAllowedOrigin ? origin : allowedOrigins[0]);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
}

// Configure middleware to run on API routes
export const config = {
  matcher: "/api/:path*", // Apply to all API routes under /api
};