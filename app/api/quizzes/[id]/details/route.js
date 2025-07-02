import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { query } from "@/lib/db"

export async function GET(request, { params }) {
  try {
    const { id } = await params

    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || "your-secret-key")

    if (decoded.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get quiz details
    const quizResult = await query("SELECT * FROM quizzes WHERE id = $1 AND teacher_id = $2", [id, decoded.userId])

    if (quizResult.rows.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const quiz = quizResult.rows[0]

    // Get questions for this quiz
    const questionsResult = await query("SELECT * FROM questions WHERE quiz_id = $1 ORDER BY question_order", [id])

    const questions = questionsResult.rows.map((row) => ({
      id: row.id,
      question: row.question_text,
      options: row.options,
      correctAnswer: row.correct_answer,
      explanation: row.explanation,
    }))

    const quizData = {
      id: quiz.id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      isPublic: quiz.is_public,
      createdAt: quiz.created_at,
      publishedAt: quiz.published_at,
      questions,
    }

    return NextResponse.json({ quiz: quizData })
  } catch (error) {
    console.error("Error fetching quiz details:", error)
    return NextResponse.json({ error: "Failed to fetch quiz details" }, { status: 500 })
  }
}
