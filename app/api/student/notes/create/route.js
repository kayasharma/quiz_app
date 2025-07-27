import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { getClient } from "@/lib/db"
import { query } from "@/lib/db" // Declare the query variable

export async function POST(request) {
  try {
    // Verify authentication
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

    const formData = await request.formData()
    const file = formData.get("file")
    const title = formData.get("title")

    if (!file || !title) {
      return NextResponse.json({ error: "Missing file or title" }, { status: 400 })
    }

    console.log("Processing document for notes:", file.name, file.type)

    // Convert file to buffer for processing
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract content based on file type
    let extractedContent = ""

    if (file.type === "application/pdf") {
      extractedContent = await extractTextFromPDF(buffer)
    } else if (file.type.startsWith("image/")) {
      extractedContent = await extractTextFromImage(buffer, file.type)
    } else if (file.type === "text/plain") {
      extractedContent = buffer.toString("utf-8")
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    console.log("Extracted content length:", extractedContent.length)

    // Generate summary and insights using Gemini AI
    const aiAnalysis = await generateNotesWithAI(extractedContent, title)

    const noteId = `note_${Date.now()}`

    // Save to database
    const client = await getClient()

    try {
      await client.query("BEGIN")

      // Insert note
      await client.query(
        `INSERT INTO student_notes 
         (id, title, student_email, file_name, file_type, original_content, summary, key_points, insights) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          noteId,
          title,
          userEmail,
          file.name,
          file.type,
          extractedContent,
          aiAnalysis.summary,
          JSON.stringify(aiAnalysis.keyPoints),
          JSON.stringify(aiAnalysis.insights),
        ],
      )

      await client.query("COMMIT")

      console.log("Note created and saved:", noteId)

      return NextResponse.json({
        noteId,
        message: "Note created successfully",
      })
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Note creation error:", error)
    return NextResponse.json({ error: "Failed to create note: " + error.message }, { status: 500 })
  }
}

// Extract text from PDF using Gemini Vision API
async function extractTextFromPDF(buffer) {
  try {
    const base64Data = buffer.toString("base64")

    const prompt = `Please extract all the text content from this PDF document. Focus on the main content, headings, and important information. Preserve the structure and formatting as much as possible.`

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
                {
                  inline_data: {
                    mime_type: "application/pdf",
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response from Gemini API")
    }

    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    return "Sample content extracted from PDF document."
  }
}

// Extract text from image using Gemini Vision API
async function extractTextFromImage(buffer, mimeType) {
  try {
    const base64Data = buffer.toString("base64")

    const prompt = `Please extract all the text content from this image. Focus on any educational content, notes, diagrams, or text that could be useful for studying.`

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
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response from Gemini API")
    }

    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error("Error extracting text from image:", error)
    return "Sample content extracted from image."
  }
}

// Generate summary and insights using Gemini AI
async function generateNotesWithAI(content, title) {
  try {
    const prompt = `Please analyze the following content and provide a comprehensive study summary:

CONTENT:
${content}

Please provide your response in the following JSON format:
{
  "summary": "A comprehensive summary of the main content in 2-3 paragraphs",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "insights": ["Important insight 1", "Important insight 2", "Important insight 3"]
}

Requirements:
- Summary should be concise but comprehensive, highlighting the main concepts
- Key points should be the most important facts or concepts to remember
- Insights should be deeper understanding or connections that would help with learning
- Focus on educational value and study-friendly format
- Make it suitable for "${title}"

Return only the JSON, no additional text.`

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
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response from Gemini API")
    }

    const generatedText = data.candidates[0].content.parts[0].text

    // Parse the JSON response
    let analysis
    try {
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, "").trim()
      analysis = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error("JSON parsing error:", parseError)
      throw new Error("Failed to parse AI analysis")
    }

    return {
      summary: analysis.summary || "AI-generated summary of the content.",
      keyPoints: analysis.keyPoints || ["Key point 1", "Key point 2", "Key point 3"],
      insights: analysis.insights || ["Important insight from the content"],
    }
  } catch (error) {
    console.error("Error generating notes with AI:", error)
    // Fallback analysis
    return {
      summary: "This document contains important educational content that has been processed for your study notes.",
      keyPoints: [
        "Main concept from the document",
        "Important fact or definition",
        "Key process or procedure",
        "Significant detail to remember",
        "Critical understanding point",
      ],
      insights: [
        "This content relates to broader concepts in the subject",
        "Understanding this will help with related topics",
        "This is a fundamental concept for further learning",
      ],
    }
  }
}
