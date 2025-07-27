import { NextResponse } from "next/server"
import { query, getClient } from "@/lib/db"

export async function GET() {
  try {
    // Check if demo quiz exists in database
    const demoQuiz = await query("SELECT * FROM quizzes WHERE id = 'quiz_demo'")

    if (demoQuiz.rows.length === 0) {
      // Create demo quiz if it doesn't exist
      const client = await getClient()

      try {
        await client.query("BEGIN")

        // Insert demo quiz
        await client.query(
          "INSERT INTO quizzes (id, title, topic, difficulty, teacher_id, is_public) VALUES ($1, $2, $3, $4, $5, $6)",
          ["quiz_demo", "JavaScript Fundamentals Demo", "JavaScript", "medium", 1, true],
        )

        // Insert demo questions
        const demoQuestions = [
          {
            question: "What is the correct way to declare a variable in JavaScript?",
            options: ["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"],
            correctAnswer: "var x = 5;",
            explanation: "var is one of the keywords used to declare variables in JavaScript",
          },
          {
            question: "Which method is used to add an element to the end of an array?",
            options: ["push()", "pop()", "shift()", "unshift()"],
            correctAnswer: "push()",
            explanation: "The push() method adds one or more elements to the end of an array",
          },
          {
            question: "What does '===' operator do in JavaScript?",
            options: ["Assigns a value", "Compares values only", "Compares values and types", "Creates a variable"],
            correctAnswer: "Compares values and types",
            explanation: "The === operator performs strict equality comparison, checking both value and type",
          },
          {
            question: "How do you create a function in JavaScript?",
            options: [
              "function myFunction() {}",
              "create myFunction() {}",
              "def myFunction() {}",
              "func myFunction() {}",
            ],
            correctAnswer: "function myFunction() {}",
            explanation: "Functions in JavaScript are declared using the 'function' keyword",
          },
          {
            question: "What is the correct way to write a JavaScript array?",
            options: [
              "var colors = 'red', 'green', 'blue'",
              "var colors = (1:'red', 2:'green', 3:'blue')",
              "var colors = ['red', 'green', 'blue']",
              "var colors = 1 = ('red'), 2 = ('green'), 3 = ('blue')",
            ],
            correctAnswer: "var colors = ['red', 'green', 'blue']",
            explanation: "JavaScript arrays are written with square brackets and comma-separated values",
          },
        ]

        for (let i = 0; i < demoQuestions.length; i++) {
          const q = demoQuestions[i]
          await client.query(
            "INSERT INTO questions (quiz_id, question_text, options, correct_answer, explanation, question_order) VALUES ($1, $2, $3, $4, $5, $6)",
            ["quiz_demo", q.question, JSON.stringify(q.options), q.correctAnswer, q.explanation, i + 1],
          )
        }

        await client.query("COMMIT")
        console.log("Demo quiz created successfully!")
      } catch (error) {
        await client.query("ROLLBACK")
        throw error
      } finally {
        client.release()
      }
    }

    // Now fetch the demo quiz with questions
    const quizResult = await query("SELECT * FROM quizzes WHERE id = 'quiz_demo'")
    const questionsResult = await query("SELECT * FROM questions WHERE quiz_id = 'quiz_demo' ORDER BY question_order")

    const quiz = quizResult.rows[0]
    const questions = questionsResult.rows.map((row) => ({
      id: row.id,
      question: row.question_text,
      options: row.options,
    }))

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        questions,
      },
    })
  } catch (error) {
    console.error("Error fetching demo quiz:", error)
    return NextResponse.json({ error: "Failed to fetch demo quiz" }, { status: 500 })
  }
}
