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

    // Get quizzes for this teacher with question counts and attempt counts
    const result = await query(
      `
      SELECT 
        q.*,
        COUNT(DISTINCT qs.id) as question_count,
        COUNT(DISTINCT qa.id) as attempt_count
      FROM quizzes q
      LEFT JOIN questions qs ON q.id = qs.quiz_id
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
      WHERE q.teacher_id = $1
      GROUP BY q.id, q.title, q.topic, q.difficulty, q.teacher_id, q.is_public, q.created_at, q.updated_at, q.published_at
      ORDER BY q.created_at DESC
    `,
      [decoded.userId],
    )

    const quizzes = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      topic: row.topic,
      difficulty: row.difficulty,
      isPublic: row.is_public,
      createdAt: row.created_at,
      publishedAt: row.published_at,
      questionCount: Number.parseInt(row.question_count) || 0,
      attempts: Number.parseInt(row.attempt_count) || 0,
    }))

    return NextResponse.json({ quizzes })
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 })
  }
}
