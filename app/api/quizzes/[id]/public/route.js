import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request, { params }) {
  try {
    const { id } = await params

    // Get quiz details (only public quizzes)
    const quizResult = await query("SELECT * FROM quizzes WHERE id = $1 AND is_public = true", [id])

    if (quizResult.rows.length === 0) {
      return NextResponse.json({ error: "Quiz not found or not accessible" }, { status: 404 })
    }

    const quiz = quizResult.rows[0]

    // Get questions for this quiz (without correct answers for public access)
    const questionsResult = await query(
      "SELECT id, question_text, options FROM questions WHERE quiz_id = $1 ORDER BY question_order",
      [id],
    )

    const questions = questionsResult.rows.map((row) => ({
      id: row.id,
      question: row.question_text,
      options: row.options,
    }))

    const quizData = {
      id: quiz.id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      questions,
    }

    return NextResponse.json({ quiz: quizData })
  } catch (error) {
    console.error("Error fetching public quiz:", error)
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 })
  }
}
