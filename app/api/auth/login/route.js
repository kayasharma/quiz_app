import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { query } from "@/lib/db"

export async function POST(request) {
  try {
    const { email, password, role } = await request.json()

    // Find user in database
    const result = await query("SELECT id, name, email, role FROM users WHERE email = $1 AND role = $2", [email, role])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = result.rows[0]

    // In a real app, you should hash and compare passwords
    // For now, we'll use a simple check
    const passwordCheck = await query("SELECT password FROM users WHERE id = $1", [user.id])

    if (passwordCheck.rows[0].password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token with 24 hour expiration
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    )

    // Set cookie with 24 hour expiration
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours in seconds
      path: "/",
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
