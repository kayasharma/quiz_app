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
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material"
import { motion } from "framer-motion"
import { IconUpload, IconFile, IconPhoto, IconBrain, IconArrowLeft } from "@tabler/icons-react"

export default function CreateNotesPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState("")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const steps = ["Upload Document", "Add Details", "AI Processing"]

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "text/plain"]
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile)
        setError("")
        setActiveStep(1)
      } else {
        setError("Please upload a PDF, image file (JPG, PNG), or text file")
      }
    }
  }

  const handleNext = () => {
    if (activeStep === 1 && title.trim()) {
      setActiveStep(2)
      processDocument()
    }
  }

  const processDocument = async () => {
    setProcessing(true)
    setError("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)

    try {
      const response = await fetch("/api/student/notes/create", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/student/notes/${data.noteId}`)
      } else {
        setError(data.error || "Failed to process document")
        setActiveStep(1)
      }
    } catch (error) {
      console.error("Error processing document:", error)
      setError("An error occurred while processing your document")
      setActiveStep(1)
    } finally {
      setProcessing(false)
    }
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
            {/* Header */}
            <Box sx={{ p: 4, backgroundColor: "primary.main", color: "white" }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Button
                  onClick={() => router.push("/student/dashboard")}
                  sx={{ color: "white", minWidth: "auto", p: 1 }}
                >
                  <IconArrowLeft />
                </Button>
                <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
                  AI Notes Summarizer
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Upload your documents and get AI-powered summaries with key insights
              </Typography>
            </Box>

            {/* Stepper */}
            <Box sx={{ p: 3 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {error && (
              <Box sx={{ px: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              </Box>
            )}

            {/* Step Content */}
            <Box sx={{ p: 3 }}>
              {/* Step 1: Upload Document */}
              {activeStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", textAlign: "center" }}>
                    Upload Your Document
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>
                    Supported formats: PDF, JPG, PNG, TXT
                  </Typography>

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
                    <CardContent sx={{ textAlign: "center", py: 6 }}>
                      {file ? (
                        <Box>
                          {file.type.startsWith("image/") ? (
                            <IconPhoto size={64} color="#666" />
                          ) : (
                            <IconFile size={64} color="#666" />
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
                          <IconUpload size={64} color="#666" />
                          <Typography variant="h6" mt={2}>
                            Click to upload your document
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            PDF, Images, or Text files
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.txt"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </motion.div>
              )}

              {/* Step 2: Add Details */}
              {activeStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", textAlign: "center" }}>
                    Add Note Details
                  </Typography>

                  <Box display="flex" alignItems="center" gap={2} mb={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                    {file?.type.startsWith("image/") ? <IconPhoto size={24} /> : <IconFile size={24} />}
                    <Typography variant="body2">{file?.name}</Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Note Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Biology Chapter 5 - Cell Structure"
                    required
                    sx={{ mb: 3 }}
                  />

                  <Box display="flex" gap={2} justifyContent="center">
                    <Button variant="outlined" onClick={() => setActiveStep(0)}>
                      Back
                    </Button>
                    <Button variant="contained" onClick={handleNext} disabled={!title.trim()}>
                      Process with AI
                    </Button>
                  </Box>
                </motion.div>
              )}

              {/* Step 3: AI Processing */}
              {activeStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box textAlign="center">
                    <IconBrain size={64} color="#667eea" />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mt: 2 }}>
                      AI is Processing Your Document
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Extracting text, analyzing content, and generating key insights...
                    </Typography>

                    {processing && (
                      <Box sx={{ mb: 3 }}>
                        <LinearProgress />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          This may take a few moments...
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </motion.div>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  )
}
