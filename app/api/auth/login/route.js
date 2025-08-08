import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const { email, password, role } = await request.json();
    console.log("📩 Received credentials:", { email, password, role });

    // 1️⃣ Find user by email + role
    const result = await query(
      "SELECT id, name, email, role, password FROM users WHERE email = $1 AND role = $2",
      [email, role]
    );
    console.log("📊 DB query result:", result.rows);

    if (result.rows.length === 0) {
      console.log("❌ No user found with this email & role");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = result.rows[0];
    console.log("✅ User found:", { id: user.id, email: user.email, role: user.role });

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔑 Password match:", isMatch);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 3️⃣ Sign JWT with correct secret
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: "24h" }
    );
    console.log("🎫 JWT generated");

    // 4️⃣ Set cookie (cross-domain safe for production)
    const cookieStore = cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only secure in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' for cross-domain
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    console.log("🍪 Auth cookie set successfully");

    // 5️⃣ Send response
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("💥 Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
