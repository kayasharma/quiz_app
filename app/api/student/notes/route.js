import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || "your-secret-key")

    if (decoded.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get user email
    const userResult = await query("SELECT email FROM users WHERE id = $1", [decoded.userId])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userEmail = userResult.rows[0].email

    // Get notes for this student
    const notesResult = await query(
      `
      SELECT id, title, summary, file_type, created_at
      FROM student_notes
      WHERE student_email = $1
      ORDER BY created_at DESC
    `,
      [userEmail],
    )

    const notes = notesResult.rows

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}
