import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token");

    if (!token) {
      return NextResponse.json({ user: null });
    }

    try {
      // Securely handle JWT_SECRET
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("JWT_SECRET is not set");
      const decoded = jwt.verify(token.value, secret);

      // Get user from database
      const result = await query("SELECT id, name, email, role FROM users WHERE id = $1", [decoded.userId]);

      if (result.rows.length === 0) {
        // Token is valid but user not found, clear the cookie
        const response = NextResponse.json({ user: null });
        response.cookies.delete("auth-token");
        return response;
      }

      const user = result.rows[0];
      return NextResponse.json({ user });
    } catch (jwtError) {
      // Token is invalid or expired, clear the cookie
      const response = NextResponse.json({ user: null });
      response.cookies.delete("auth-token");
      return response;
    }
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ user: null });
  }
}