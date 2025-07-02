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
  Alert,
  LinearProgress,
  Card,
  CardContent,
} from "@mui/material"
import { motion } from "framer-motion"
import { IconUpload, IconFile, IconPhoto } from "@tabler/icons-react"

export default function UploadQuizPage() {
  const [file, setFile] = useState(null)
  const [quizData, setQuizData] = useState({
    title: "",
    difficulty: "medium",
    questionCount: 10,
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile)
        setError("")
      } else {
        setError("Please upload a PDF or image file (JPG, PNG)")
      }
    }
  }

  const handleUpload = async () => {
    if (!file || !quizData.title) {
      setError("Please provide a title and select a file")
      return
    }

    setUploading(true)
    setError("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", quizData.title)
    formData.append("difficulty", quizData.difficulty)
    formData.append("questionCount", quizData.questionCount)

    try {
      const response = await fetch("/api/quizzes/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/quiz/create/${data.quizId}`)
      } else {
        setError(data.error || "Upload failed")
      }
    } catch (error) {
      setError("An error occurred during upload")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="quiz-container">
      <Container maxWidth="md" sx={{ py: 8 }}>
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
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
                Upload Content for Quiz Generation
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Upload a PDF document or image and let AI create quiz questions from it
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box mb={3}>
              <TextField
                fullWidth
                label="Quiz Title"
                value={quizData.title}
                onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                margin="normal"
                required
              />

              <Box display="flex" gap={2} mt={2}>
                <FormControl fullWidth>
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

                <TextField
                  label="Questions"
                  type="number"
                  value={quizData.questionCount}
                  onChange={(e) => setQuizData({ ...quizData, questionCount: Number.parseInt(e.target.value) })}
                  inputProps={{ min: 5, max: 30 }}
                  sx={{ minWidth: 120 }}
                />
              </Box>
            </Box>

            <Card
              sx={{
                border: "2px dashed #ccc",
                backgroundColor: "#f9f9f9",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                },
              }}
              onClick={() => document.getElementById("file-input").click()}
            >
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                {file ? (
                  <Box>
                    {file.type.startsWith("image/") ? (
                      <IconPhoto size={48} color="#666" />
                    ) : (
                      <IconFile size={48} color="#666" />
                    )}
                    <Typography variant="h6" mt={2}>
                      {file.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <IconUpload size={48} color="#666" />
                    <Typography variant="h6" mt={2}>
                      Click to upload file
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supports PDF, JPG, PNG files
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            <input
              id="file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {uploading && (
              <Box mt={3}>
                <Typography variant="body2" gutterBottom>
                  Processing file and generating questions...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            <Box mt={4} display="flex" gap={2} justifyContent="center">
              <Button variant="outlined" onClick={() => router.push("/dashboard")} disabled={uploading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!file || !quizData.title || uploading}
                size="large"
              >
                {uploading ? "Processing..." : "Generate Quiz"}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  )
}
