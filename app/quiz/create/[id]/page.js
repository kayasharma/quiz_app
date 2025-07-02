"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material"
import { motion } from "framer-motion"
import { IconCheck, IconShare, IconEdit, IconEye } from "@tabler/icons-react"

// Simple session hook
function useSession() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      })
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Session check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return { user, loading }
}

export default function CreateQuizPage() {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [quizUrl, setQuizUrl] = useState("")
  const params = useParams()
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  useEffect(() => {
    if (!sessionLoading && (!user || user.role !== "teacher")) {
      router.push("/auth/login?role=teacher")
      return
    }
    if (user) {
      fetchQuiz()
    }
  }, [params.id, user, sessionLoading, router])

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${params.id}/details`)
      if (response.ok) {
        const data = await response.json()
        setQuiz(data.quiz)
      } else {
        // Fallback: try to get from global quizzes
        const quizResponse = await fetch("/api/quizzes")
        if (quizResponse.ok) {
          const quizData = await quizResponse.json()
          const foundQuiz = quizData.quizzes?.find((q) => q.id === params.id)
          if (foundQuiz) {
            setQuiz(foundQuiz)
          } else {
            setError("Quiz not found")
          }
        } else {
          setError("Failed to load quiz")
        }
      }
      setQuizUrl(`${window.location.origin}/quiz/${params.id}`)
    } catch (error) {
      console.error("Error fetching quiz:", error)
      setError("Failed to load quiz")
    } finally {
      setLoading(false)
    }
  }

  const handlePublishQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${params.id}/publish`, {
        method: "POST",
      })
      if (response.ok) {
        setShareDialogOpen(true)
      }
    } catch (error) {
      console.error("Error publishing quiz:", error)
    }
  }

  const copyQuizLink = () => {
    navigator.clipboard.writeText(quizUrl)
    alert("Quiz link copied to clipboard!")
  }

  if (sessionLoading || loading) {
    return (
      <div className="quiz-container">
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ color: "white" }} />
            <Typography variant="h6" sx={{ color: "white", mt: 2 }}>
              Loading your quiz...
            </Typography>
          </Box>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="quiz-container">
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </Container>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="quiz-container">
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Quiz not found
          </Alert>
          <Button variant="contained" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </Container>
      </div>
    )
  }

  return (
    <div className="quiz-container">
      <Container maxWidth="md" sx={{ py: 4 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Paper
            elevation={10}
            sx={{
              backgroundColor: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box sx={{ p: 4, backgroundColor: "primary.main", color: "white" }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
                {quiz.title}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={`Topic: ${quiz.topic}`}
                  sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
                />
                <Chip
                  label={`Difficulty: ${quiz.difficulty}`}
                  sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
                />
                <Chip
                  label={`${quiz.questions?.length || 0} Questions`}
                  sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
                />
              </Box>
            </Box>

            {/* Questions Preview */}
            <Box sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
                Questions Preview
              </Typography>

              {quiz.questions?.map((question, index) => (
                <Card key={question.id} sx={{ mb: 3, border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {index + 1}. {question.question}
                    </Typography>
                    <Box sx={{ ml: 2 }}>
                      {question.options?.map((option, optionIndex) => (
                        <Typography
                          key={optionIndex}
                          variant="body2"
                          sx={{
                            p: 1,
                            mb: 0.5,
                            borderRadius: 1,
                            backgroundColor:
                              option === question.correctAnswer ? "rgba(76, 175, 80, 0.1)" : "rgba(0,0,0,0.02)",
                            border:
                              option === question.correctAnswer
                                ? "1px solid rgba(76, 175, 80, 0.3)"
                                : "1px solid #e0e0e0",
                            fontWeight: option === question.correctAnswer ? "bold" : "normal",
                          }}
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                          {option === question.correctAnswer && (
                            <IconCheck size={16} style={{ marginLeft: 8, color: "#4caf50" }} />
                          )}
                        </Typography>
                      ))}
                    </Box>
                    {question.explanation && (
                      <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                          <strong>Explanation:</strong> {question.explanation}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Actions */}
            <Box sx={{ p: 3, backgroundColor: "#f5f5f5", display: "flex", gap: 2, justifyContent: "center" }}>
              <Button variant="outlined" startIcon={<IconEdit />} onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
              <Button variant="outlined" startIcon={<IconEye />} onClick={() => window.open(quizUrl, "_blank")}>
                Preview Quiz
              </Button>
              <Button variant="contained" startIcon={<IconShare />} onClick={handlePublishQuiz}>
                Publish & Share
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Quiz Published Successfully!</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Your quiz is now live and ready to be shared with students.
            </Typography>
            <TextField
              fullWidth
              label="Quiz URL"
              value={quizUrl}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              onClick={(e) => e.target.select()}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
            <Button onClick={copyQuizLink} variant="contained">
              Copy Link
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  )
}
