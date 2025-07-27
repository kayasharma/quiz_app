import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { getClient } from "@/lib/db"

export async function POST(request) {
  try {
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

    const { title, topic, difficulty, questions } = await request.json()

    if (!title || !topic || !questions || questions.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate questions format
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question || !q.options || q.options.length !== 4 || !q.correctAnswer || !q.explanation) {
        return NextResponse.json({ error: `Invalid question format at index ${i}` }, { status: 400 })
      }
    }

    const quizId = `quiz_${Date.now()}`

    // Save to database
    const client = await getClient()

    try {
      await client.query("BEGIN")

      // Insert quiz
      await client.query(
        "INSERT INTO quizzes (id, title, topic, difficulty, teacher_id, is_public) VALUES ($1, $2, $3, $4, $5, $6)",
        [quizId, title, topic, difficulty, decoded.userId, true],
      )

      // Insert questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]
        await client.query(
          "INSERT INTO questions (quiz_id, question_text, options, correct_answer, explanation, question_order) VALUES ($1, $2, $3, $4, $5, $6)",
          [
            quizId,
            question.question,
            JSON.stringify(question.options),
            question.correctAnswer,
            question.explanation,
            i + 1,
          ],
        )
      }

      await client.query("COMMIT")

      console.log("Manual quiz created and saved:", quizId)

      return NextResponse.json({
        quizId,
        message: "Quiz created successfully",
        questionsCreated: questions.length,
      })
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Manual quiz creation error:", error)
    return NextResponse.json({ error: "Failed to create quiz: " + error.message }, { status: 500 })
  }
}
