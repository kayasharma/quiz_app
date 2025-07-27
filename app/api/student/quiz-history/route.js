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

    // Get quiz history for this student (by email since students don't have accounts)
    const userResult = await query("SELECT email FROM users WHERE id = $1", [decoded.userId])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userEmail = userResult.rows[0].email

    const historyResult = await query(
      `
      SELECT 
        qa.*,
        q.title as quiz_title,
        q.topic,
        q.difficulty
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.student_email = $1
      ORDER BY qa.submitted_at DESC
    `,
      [userEmail],
    )

    const history = historyResult.rows

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Error fetching quiz history:", error)
    return NextResponse.json({ error: "Failed to fetch quiz history" }, { status: 500 })
  }
}
