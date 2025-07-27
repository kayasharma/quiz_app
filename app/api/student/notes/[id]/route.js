import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { query } from "@/lib/db"

export async function GET(request, { params }) {
    try {
        const { id } = await params

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

        // Get note details
        const noteResult = await query("SELECT * FROM student_notes WHERE id = $1 AND student_email = $2", [id, userEmail])

        if (noteResult.rows.length === 0) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 })
        }

        const note = noteResult.rows[0]
        function isJsonString(str) {
            try {
                JSON.parse(str)
                return true
            } catch (e) {
                return false
            }
        }

        const noteData = {
            ...note,
            key_points: isJsonString(note.key_points) ? JSON.parse(note.key_points) : note.key_points,
            insights: isJsonString(note.insights) ? JSON.parse(note.insights) : note.insights,
        }


        return NextResponse.json({ note: noteData })
    } catch (error) {
        console.error("Error fetching note:", error)
        return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 })
    }
}
