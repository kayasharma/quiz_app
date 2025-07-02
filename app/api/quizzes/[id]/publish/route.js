import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function POST(request, { params }) {
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

    // Get quiz from global storage and mark as public
    if (!global.quizzes) {
      global.quizzes = []
    }

    const quizIndex = global.quizzes.findIndex((q) => q.id === id && q.teacherId === decoded.userId)

    if (quizIndex === -1) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Mark quiz as public
    global.quizzes[quizIndex].isPublic = true
    global.quizzes[quizIndex].publishedAt = new Date()

    return NextResponse.json({
      message: "Quiz published successfully",
      quiz: global.quizzes[quizIndex],
    })
  } catch (error) {
    console.error("Error publishing quiz:", error)
    return NextResponse.json({ error: "Failed to publish quiz" }, { status: 500 })
  }
}
