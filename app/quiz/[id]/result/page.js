"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Container, Paper, Typography, Box, Button, Card, CardContent, LinearProgress, Chip } from "@mui/material"
import { motion } from "framer-motion"
import { IconCheck, IconX, IconHome, IconRefresh } from "@tabler/icons-react"

export default function QuizResultPage() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    // Get result from sessionStorage (set after quiz submission)
    const storedResult = sessionStorage.getItem(`quiz_result_${params.id}`)
    if (storedResult) {
      setResult(JSON.parse(storedResult))
    }
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="student-quiz-container">
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: "white" }}>
              Loading results...
            </Typography>
          </Box>
        </Container>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="student-quiz-container">
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              No results found
            </Typography>
            <Button variant="contained" onClick={() => router.push("/")} startIcon={<IconHome />}>
              Back to Home
            </Button>
          </Paper>
        </Container>
      </div>
    )
  }

  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100)
  const getGradeColor = (score) => {
    if (score >= 80) return "#4caf50"
    if (score >= 60) return "#ff9800"
    return "#f44336"
  }

  return (
    <div className="student-quiz-container">
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
            {/* Score Header */}
            <Box
              sx={{
                p: 4,
                backgroundColor: getGradeColor(percentage),
                color: "white",
                textAlign: "center",
              }}
            >
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
                {percentage}%
              </Typography>
              <Typography variant="h5" gutterBottom>
                {result.correctAnswers} out of {result.totalQuestions} correct
              </Typography>
              <Typography variant="body1">
                {percentage >= 80 ? "Excellent work!" : percentage >= 60 ? "Good job!" : "Keep practicing!"}
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ p: 2 }}>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: getGradeColor(percentage),
                  },
                }}
              />
            </Box>

            {/* Detailed Results */}
            <Box sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Question Review
              </Typography>

              {result.results?.map((item, index) => (
                <Card
                  key={item.questionId}
                  sx={{
                    mb: 2,
                    border: `2px solid ${item.isCorrect ? "#4caf50" : "#f44336"}`,
                    backgroundColor: item.isCorrect ? "rgba(76, 175, 80, 0.05)" : "rgba(244, 67, 54, 0.05)",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      {item.isCorrect ? <IconCheck size={24} color="#4caf50" /> : <IconX size={24} color="#f44336" />}
                      <Box flex={1}>
                        <Typography variant="h6" gutterBottom>
                          {index + 1}. {item.question}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Your answer:
                          </Typography>
                          <Chip
                            label={item.studentAnswer || "No answer"}
                            color={item.isCorrect ? "success" : "error"}
                            variant="outlined"
                          />
                        </Box>

                        {!item.isCorrect && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Correct answer:
                            </Typography>
                            <Chip label={item.correctAnswer} color="success" variant="outlined" />
                          </Box>
                        )}

                        {item.explanation && (
                          <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography variant="body2">
                              <strong>Explanation:</strong> {item.explanation}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Actions */}
            <Box sx={{ p: 3, backgroundColor: "#f5f5f5", display: "flex", gap: 2, justifyContent: "center" }}>
              <Button variant="outlined" startIcon={<IconHome />} onClick={() => router.push("/")}>
                Back to Home
              </Button>
              <Button variant="contained" startIcon={<IconRefresh />} onClick={() => router.push(`/quiz/${params.id}`)}>
                Retake Quiz
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  )
}
