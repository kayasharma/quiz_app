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

    // Get quiz statistics
    const quizStatsResult = await query(
      `
      SELECT 
        COUNT(*) as total_quizzes,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(MAX(score), 0) as best_score
      FROM quiz_attempts
      WHERE student_email = $1
    `,
      [userEmail],
    )

    // Get notes count
    const notesStatsResult = await query(
      `
      SELECT COUNT(*) as total_notes
      FROM student_notes
      WHERE student_email = $1
    `,
      [userEmail],
    )

    const quizStats = quizStatsResult.rows[0]
    const notesStats = notesStatsResult.rows[0]

    const stats = {
      totalQuizzes: Number.parseInt(quizStats.total_quizzes) || 0,
      averageScore: Math.round(Number.parseFloat(quizStats.average_score)) || 0,
      bestScore: Number.parseInt(quizStats.best_score) || 0,
      totalNotes: Number.parseInt(notesStats.total_notes) || 0,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching student stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
