"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Alert,
  Divider,
  Chip,
} from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import { IconPlus, IconTrash, IconFolderPlus, IconArrowLeft } from "@tabler/icons-react"

export default function ManualQuizPage() {
  const [quizData, setQuizData] = useState({
    title: "",
    topic: "",
    difficulty: "medium",
  })
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
    },
  ])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)) } : q,
      ),
    )
  }

  const validateQuiz = () => {
    if (!quizData.title || !quizData.topic) {
      setError("Please fill in quiz title and topic")
      return false
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question) {
        setError(`Question ${i + 1}: Please enter the question text`)
        return false
      }

      const filledOptions = q.options.filter((opt) => opt.trim() !== "")
      if (filledOptions.length < 4) {
        setError(`Question ${i + 1}: Please fill in all 4 options`)
        return false
      }

      if (!q.correctAnswer) {
        setError(`Question ${i + 1}: Please select the correct answer`)
        return false
      }

      if (!q.options.includes(q.correctAnswer)) {
        setError(`Question ${i + 1}: Correct answer must match one of the options`)
        return false
      }

      if (!q.explanation) {
        setError(`Question ${i + 1}: Please provide an explanation`)
        return false
      }
    }

    return true
  }

  const handleCreateQuiz = async () => {
    if (!validateQuiz()) return

    setCreating(true)
    setError("")

    try {
      const response = await fetch("/api/quizzes/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...quizData,
          questions: questions.map((q) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/quiz/create/${data.quizId}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create quiz")
      }
    } catch (error) {
      console.error("Error creating quiz:", error)
      setError("Failed to create quiz. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="quiz-container">
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <IconButton onClick={() => router.push("/dashboard")} sx={{ color: "white" }}>
                  <IconArrowLeft />
                </IconButton>
                <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
                  Create Manual Quiz
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Create custom quiz questions manually with full control over content
              </Typography>
            </Box>

            {/* Quiz Details */}
            <Box sx={{ p: 4 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Quiz Details
              </Typography>

              <Box display="flex" gap={2} mb={4}>
                <TextField
                  fullWidth
                  label="Quiz Title"
                  value={quizData.title}
                  onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Topic"
                  value={quizData.topic}
                  onChange={(e) => setQuizData({ ...quizData, topic: e.target.value })}
                  required
                />
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={quizData.difficulty}
                    onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value })}
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ mb: 4 }} />

              {/* Questions */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Questions ({questions.length})
                </Typography>
                <Button variant="outlined" startIcon={<IconPlus />} onClick={addQuestion}>
                  Add Question
                </Button>
              </Box>

              <AnimatePresence>
                {questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card sx={{ mb: 3, border: "1px solid #e0e0e0" }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Chip label={`Question ${index + 1}`} color="primary" variant="outlined" />
                          {questions.length > 1 && (
                            <IconButton onClick={() => removeQuestion(question.id)} color="error" size="small">
                              <IconTrash />
                            </IconButton>
                          )}
                        </Box>

                        <TextField
                          fullWidth
                          label="Question"
                          multiline
                          rows={2}
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                          sx={{ mb: 2 }}
                          required
                        />

                        <Typography variant="subtitle2" gutterBottom>
                          Options:
                        </Typography>
                        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                          {question.options.map((option, optionIndex) => (
                            <TextField
                              key={optionIndex}
                              label={`Option ${String.fromCharCode(65 + optionIndex)}`}
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              required
                            />
                          ))}
                        </Box>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Correct Answer</InputLabel>
                          <Select
                            value={question.correctAnswer}
                            onChange={(e) => updateQuestion(question.id, "correctAnswer", e.target.value)}
                          >
                            {question.options.map((option, idx) => (
                              <MenuItem key={idx} value={option} disabled={!option.trim()}>
                                {option || `Option ${String.fromCharCode(65 + idx)}`}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <TextField
                          fullWidth
                          label="Explanation"
                          multiline
                          rows={2}
                          value={question.explanation}
                          onChange={(e) => updateQuestion(question.id, "explanation", e.target.value)}
                          placeholder="Explain why this answer is correct..."
                          required
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4 }}>
                <Button variant="outlined" onClick={() => router.push("/dashboard")} disabled={creating}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<IconFolderPlus />}
                  onClick={handleCreateQuiz}
                  disabled={creating}
                  size="large"
                >
                  {creating ? "Creating Quiz..." : "Create Quiz"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  )
}
