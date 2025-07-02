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

    if (decoded.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get statistics for this teacher
    const statsResult = await query(
      `
      SELECT 
        COUNT(DISTINCT q.id) as total_quizzes,
        COUNT(DISTINCT qa.student_email) as total_students,
        COUNT(qa.id) as total_attempts
      FROM quizzes q
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
      WHERE q.teacher_id = $1
    `,
      [decoded.userId],
    )

    const stats = {
      totalQuizzes: Number.parseInt(statsResult.rows[0].total_quizzes) || 0,
      totalStudents: Number.parseInt(statsResult.rows[0].total_students) || 0,
      totalAttempts: Number.parseInt(statsResult.rows[0].total_attempts) || 0,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
