"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  TextField,
  Alert,
} from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import { IconArrowLeft, IconArrowRight, IconCheck } from "@tabler/icons-react"

export default function TakeQuizPage() {
  const [quiz, setQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    email: "",
    studentId: "",
  })
  const [showStudentForm, setShowStudentForm] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    fetchQuiz()
  }, [params.id])

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${params.id}/public`)
      const data = await response.json()

      if (response.ok) {
        setQuiz(data.quiz)
      } else {
        setError(data.error || "Quiz not found")
      }
    } catch (error) {
      setError("Failed to load quiz")
    } finally {
      setLoading(false)
    }
  }

  const handleStudentInfoSubmit = () => {
    if (studentInfo.name && studentInfo.email) {
      setShowStudentForm(false)
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    })
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/quizzes/${params.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentInfo,
          answers,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Store result in sessionStorage for the results page
        sessionStorage.setItem(`quiz_result_${params.id}`, JSON.stringify(result))

        // Redirect to results page
        router.push(`/quiz/${params.id}/result`)
      } else {
        setError("Failed to submit quiz")
      }
    } catch (error) {
      setError("Failed to submit quiz")
    }
  }

  if (loading) {
    return (
      <div className="student-quiz-container">
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: "white" }}>
              Loading quiz...
            </Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </Box>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-quiz-container">
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="student-quiz-container">
        <Container maxWidth="md" sx={{ py: 8 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Paper
              elevation={10}
              sx={{
                p: 6,
                backgroundColor: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                textAlign: "center",
              }}
            >
              <IconCheck size={64} color="green" />
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", mt: 2 }}>
                Quiz Submitted Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Thank you for taking the quiz. Your responses have been recorded.
              </Typography>
              <Button variant="contained" onClick={() => router.push("/")} size="large">
                Back to Home
              </Button>
            </Paper>
          </motion.div>
        </Container>
      </div>
    )
  }

  if (showStudentForm) {
    return (
      <div className="student-quiz-container">
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Paper
              elevation={10}
              sx={{
                p: 4,
                backgroundColor: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
              }}
            >
              <Box textAlign="center" mb={3}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
                  {quiz.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Please provide your information before starting the quiz
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Full Name"
                value={studentInfo.name}
                onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={studentInfo.email}
                onChange={(e) => setStudentInfo({ ...studentInfo, email: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Student ID (Optional)"
                value={studentInfo.studentId}
                onChange={(e) => setStudentInfo({ ...studentInfo, studentId: e.target.value })}
                margin="normal"
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleStudentInfoSubmit}
                disabled={!studentInfo.name || !studentInfo.email}
                sx={{ mt: 3 }}
              >
                Start Quiz
              </Button>
            </Paper>
          </motion.div>
        </Container>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

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
            {/* Progress Bar */}
            <Box sx={{ p: 2, backgroundColor: "primary.main" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" sx={{ color: "white" }}>
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </Typography>
                <Typography variant="body2" sx={{ color: "white" }}>
                  {Math.round(progress)}% Complete
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.3)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "white",
                  },
                }}
              />
            </Box>

            {/* Question Content */}
            <Box sx={{ p: 4 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: "bold" }}>
                    {question.question}
                  </Typography>

                  <RadioGroup
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    sx={{ mt: 3 }}
                  >
                    {question.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={option}
                        control={<Radio />}
                        label={option}
                        sx={{
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.04)",
                          },
                        }}
                      />
                    ))}
                  </RadioGroup>
                </motion.div>
              </AnimatePresence>
            </Box>

            {/* Navigation */}
            <Box sx={{ p: 3, backgroundColor: "#f5f5f5", display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="outlined"
                startIcon={<IconArrowLeft />}
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion === quiz.questions.length - 1 ? (
                <Button
                  variant="contained"
                  startIcon={<IconCheck />}
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length !== quiz.questions.length}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button variant="contained" endIcon={<IconArrowRight />} onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  )
}
