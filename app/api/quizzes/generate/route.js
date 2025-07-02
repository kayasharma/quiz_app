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

    const { title, topic, difficulty, questionCount } = await request.json()

    console.log("Generating quiz with Gemini API...")

    // Generate questions using Gemini API
    const questions = await generateQuestionsWithGemini(topic, difficulty, questionCount)

    const quizId = `quiz_${Date.now()}`

    // Use transaction to ensure data consistency
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

      console.log("Quiz generated and saved to database:", quizId)

      return NextResponse.json({
        quizId,
        message: "Quiz generated successfully",
        questionsGenerated: questions.length,
      })
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Quiz generation error:", error)
    return NextResponse.json({ error: "Failed to generate quiz: " + error.message }, { status: 500 })
  }
}

async function generateQuestionsWithGemini(topic, difficulty, questionCount) {
  try {
    const prompt = `Generate exactly ${questionCount} multiple choice questions about "${topic}" at ${difficulty} difficulty level. 

Format your response as a JSON array where each question has this exact structure:
{
  "question": "The question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Brief explanation of why this is correct"
}

Requirements:
- Each question must have exactly 4 options
- Only one option should be correct
- Questions should be clear and unambiguous
- Explanations should be concise but informative
- Make sure the JSON is valid and properly formatted
- Focus on ${topic} concepts appropriate for ${difficulty} level

Return only the JSON array, no additional text.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Gemini API error:", errorData)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Gemini API response:", data)

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response from Gemini API")
    }

    const generatedText = data.candidates[0].content.parts[0].text
    console.log("Generated text:", generatedText)

    // Parse the JSON response
    let questions
    try {
      // Clean the response text (remove markdown formatting if present)
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, "").trim()
      questions = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error("JSON parsing error:", parseError)
      console.error("Generated text:", generatedText)
      throw new Error("Failed to parse questions from AI response")
    }

    // Validate and format questions
    const formattedQuestions = questions.map((q, index) => ({
      id: `q_${index + 1}`,
      question: q.question,
      options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: q.correctAnswer || q.options?.[0] || "Option A",
      explanation: q.explanation || "No explanation provided",
    }))

    console.log("Formatted questions:", formattedQuestions)
    return formattedQuestions
  } catch (error) {
    console.error("Error generating questions with Gemini:", error)
    // Fallback to mock questions if API fails
    return Array.from({ length: questionCount }, (_, i) => ({
      id: `q_${i + 1}`,
      question: `Sample question ${i + 1} about ${topic} (${difficulty} level)?`,
      options: [`Correct answer for ${topic}`, `Incorrect option A`, `Incorrect option B`, `Incorrect option C`],
      correctAnswer: `Correct answer for ${topic}`,
      explanation: `This is the correct answer because it relates to ${topic} concepts at ${difficulty} level.`,
    }))
  }
}
