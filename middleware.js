import { NextResponse } from "next/server";

export function middleware(request) {
  const origin = request.headers.get("origin");
  
  // Update with your actual production domain
  const allowedOrigins = [
    "https://quiz-app-six-teal-65.vercel.app",
    "http://localhost:3000",
  ];

  const response = NextResponse.next();

  // Set CORS headers only if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { 
      status: 204, 
      headers: response.headers 
    });
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};