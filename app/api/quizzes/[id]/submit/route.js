import { NextResponse } from "next/server"
import { query, getClient } from "@/lib/db"

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const { studentInfo, answers } = await request.json()

    // Get quiz with questions and correct answers
    const quizResult = await query("SELECT * FROM quizzes WHERE id = $1", [id])

    if (quizResult.rows.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const quiz = quizResult.rows[0]

    // Get all questions for this quiz
    const questionsResult = await query("SELECT * FROM questions WHERE quiz_id = $1 ORDER BY question_order", [id])

    const questions = questionsResult.rows

    // Calculate score
    let correctAnswers = 0
    const results = questions.map((question) => {
      const studentAnswer = answers[question.id]
      const isCorrect = studentAnswer === question.correct_answer
      if (isCorrect) correctAnswers++

      return {
        questionId: question.id,
        question: question.question_text,
        studentAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation,
      }
    })

    const score = Math.round((correctAnswers / questions.length) * 100)

    // Use transaction to save attempt and results
    const client = await getClient()

    try {
      await client.query("BEGIN")

      // Insert quiz attempt
      const attemptResult = await client.query(
        "INSERT INTO quiz_attempts (quiz_id, student_name, student_email, student_id, score, total_questions, correct_answers, answers) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
        [
          id,
          studentInfo.name,
          studentInfo.email,
          studentInfo.studentId || null,
          score,
          questions.length,
          correctAnswers,
          JSON.stringify(answers),
        ],
      )

      const attemptId = attemptResult.rows[0].id

      // Insert detailed results for each question
      for (const result of results) {
        await client.query(
          "INSERT INTO quiz_results (attempt_id, question_id, student_answer, is_correct) VALUES ($1, $2, $3, $4)",
          [attemptId, result.questionId, result.studentAnswer, result.isCorrect],
        )
      }

      await client.query("COMMIT")

      console.log("Quiz submission saved:", attemptId)

      return NextResponse.json({
        submissionId: attemptId,
        score,
        totalQuestions: questions.length,
        correctAnswers,
        results,
        message: "Quiz submitted successfully",
      })
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Submission error:", error)
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
}
