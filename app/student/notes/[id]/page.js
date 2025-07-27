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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
} from "@mui/material"
import { motion } from "framer-motion"
import { IconArrowLeft, IconDownload, IconShare, IconBulb, IconKey, IconFileText, IconClock } from "@tabler/icons-react"

export default function ViewNotePage() {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    fetchNote()
  }, [params.id])

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/student/notes/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setNote(data.note)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Note not found")
      }
    } catch (error) {
      console.error("Error fetching note:", error)
      setError("Failed to load note")
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    const shareData = {
      title: note.title,
      text: note.summary,
      url: window.location.href,
    }

    if (navigator.share) {
      navigator.share(shareData)
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="student-quiz-container">
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ color: "white" }} />
            <Typography variant="h6" sx={{ color: "white", mt: 2 }}>
              Loading your note...
            </Typography>
          </Box>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-quiz-container">
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => router.push("/student/dashboard")}>
            Back to Dashboard
          </Button>
        </Container>
      </div>
    )
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
                <Box flex={1}>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
                    {note.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mt={1}>
                    <Chip
                      label={note.file_type?.toUpperCase() || "PDF"}
                      size="small"
                      sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
                    />
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <IconClock size={16} />
                      <Typography variant="body2">{new Date(note.created_at).toLocaleDateString()}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ p: 2, backgroundColor: "#f5f5f5", display: "flex", gap: 1, justifyContent: "center" }}>
              <Button variant="outlined" startIcon={<IconShare />} onClick={handleShare} size="small">
                Share
              </Button>
              <Button variant="outlined" startIcon={<IconDownload />} size="small">
                Export
              </Button>
            </Box>

            {/* Content */}
            <Box sx={{ p: 4 }}>
              {/* Summary Section */}
              <Card sx={{ mb: 3, border: "2px solid #e3f2fd" }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <IconFileText size={24} color="#1976d2" />
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                      AI Summary
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {note.summary}
                  </Typography>
                </CardContent>
              </Card>

              {/* Key Points Section */}
              {note.key_points && note.key_points.length > 0 && (
                <Card sx={{ mb: 3, border: "2px solid #e8f5e8" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <IconKey size={24} color="#4caf50" />
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#4caf50" }}>
                        Key Points
                      </Typography>
                    </Box>
                    <List dense>
                      {note.key_points.map((point, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "#4caf50",
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText primary={point} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Insights Section */}
              {note.insights && note.insights.length > 0 && (
                <Card sx={{ mb: 3, border: "2px solid #fff3e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <IconBulb size={24} color="#ff9800" />
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ff9800" }}>
                        Key Insights
                      </Typography>
                    </Box>
                    <List dense>
                      {note.insights.map((insight, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <IconBulb size={16} color="#ff9800" />
                          </ListItemIcon>
                          <ListItemText primary={insight} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Original Content Preview */}
              {note.original_content && (
                <Card sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                      Original Content Preview
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        backgroundColor: "#f5f5f5",
                        p: 2,
                        borderRadius: 1,
                        maxHeight: 200,
                        overflow: "auto",
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {note.original_content.substring(0, 1000)}
                      {note.original_content.length > 1000 && "..."}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  )
}
