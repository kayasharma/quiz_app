import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { query } from "@/lib/db"

export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json()

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash the password before storing it
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Insert new user with the hashed password
    const result = await query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, role],
    )

    const user = result.rows[0]

    return NextResponse.json({
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
