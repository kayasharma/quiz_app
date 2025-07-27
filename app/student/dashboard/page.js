"use client"
import { useState, useEffect } from "react"
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Tab,
  Tabs,
  LinearProgress,
} from "@mui/material"
import { motion } from "framer-motion"
import {
  IconBook,
  IconTrophy,
  IconClock,
  IconChartBar,
  IconFileText,
  IconBrain,
  IconUpload,
  IconEye,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"

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

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState(0)
  const [quizHistory, setQuizHistory] = useState([])
  const [notes, setNotes] = useState([])
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    totalNotes: 0,
    bestScore: 0,
  })
  const [loadingData, setLoadingData] = useState(true)
  const { user, loading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.push("/auth/login?role=student")
      return
    }
    if (user) {
      fetchStudentData()
    }
  }, [user, loading, router])

  const fetchStudentData = async () => {
    try {
      // Fetch quiz history
      const quizResponse = await fetch("/api/student/quiz-history")
      if (quizResponse.ok) {
        const quizData = await quizResponse.json()
        setQuizHistory(quizData.history || [])
      }

      // Fetch notes
      const notesResponse = await fetch("/api/student/notes")
      if (notesResponse.ok) {
        const notesData = await notesResponse.json()
        setNotes(notesData.notes || [])
      }

      // Fetch stats
      const statsResponse = await fetch("/api/student/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats || stats)
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "#4caf50"
    if (score >= 60) return "#ff9800"
    return "#f44336"
  }

  const getGradeText = (score) => {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Good"
    if (score >= 70) return "Average"
    if (score >= 60) return "Below Average"
    return "Needs Improvement"
  }

  if (loading || loadingData) {
    return (
      <div className="student-quiz-container">
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ color: "white" }} />
            <Typography variant="h6" sx={{ color: "white", mt: 2 }}>
              Loading your dashboard...
            </Typography>
          </Box>
        </Container>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="student-quiz-container">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                Student Dashboard
              </Typography>
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)" }}>
                Welcome back, {user.name}!
              </Typography>
            </Box>
            <Avatar sx={{ width: 64, height: 64, bgcolor: "rgba(255,255,255,0.2)", fontSize: "1.5rem" }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <IconBook size={40} color="white" />
                    <Box ml={2}>
                      <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                        {stats.totalQuizzes}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                        Quizzes Taken
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <IconChartBar size={40} color="white" />
                    <Box ml={2}>
                      <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                        {stats.averageScore}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                        Average Score
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <IconTrophy size={40} color="white" />
                    <Box ml={2}>
                      <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                        {stats.bestScore}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                        Best Score
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <IconFileText size={40} color="white" />
                    <Box ml={2}>
                      <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                        {stats.totalNotes}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                        Notes Created
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Main Content */}
          <Paper
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                backgroundColor: "rgba(255,255,255,0.1)",
                "& .MuiTab-root": { color: "rgba(255,255,255,0.7)" },
                "& .Mui-selected": { color: "white !important" },
              }}
            >
              <Tab label="Quiz History" icon={<IconBook />} iconPosition="start" />
              <Tab label="AI Notes Summarizer" icon={<IconBrain />} iconPosition="start" />
            </Tabs>

            {/* Quiz History Tab */}
            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: "white", fontWeight: "bold", mb: 3 }}>
                  Your Quiz Performance
                </Typography>

                {quizHistory.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <IconBook size={64} color="rgba(255,255,255,0.3)" />
                    <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)", mt: 2 }}>
                      No quizzes taken yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                      Start taking quizzes to see your progress here
                    </Typography>
                    <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push("/")}>
                      Browse Quizzes
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {quizHistory.map((attempt, index) => (
                      <motion.div
                        key={attempt.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <ListItem
                          sx={{
                            backgroundColor: "rgba(255,255,255,0.05)",
                            borderRadius: 2,
                            mb: 2,
                            border: `2px solid ${getScoreColor(attempt.score)}`,
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" sx={{ color: "white" }}>
                                  {attempt.quiz_title}
                                </Typography>
                                <Chip
                                  label={`${attempt.score}%`}
                                  sx={{
                                    backgroundColor: getScoreColor(attempt.score),
                                    color: "white",
                                    fontWeight: "bold",
                                  }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box mt={1}>
                                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                                  {attempt.correct_answers}/{attempt.total_questions} correct •{" "}
                                  {getGradeText(attempt.score)}
                                </Typography>
                                <Box display="flex" alignItems="center" mt={1}>
                                  <IconClock size={16} color="rgba(255,255,255,0.5)" />
                                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", ml: 0.5 }}>
                                    {new Date(attempt.submitted_at).toLocaleDateString()}
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={attempt.score}
                                  sx={{
                                    mt: 1,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor: getScoreColor(attempt.score),
                                    },
                                  }}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                      </motion.div>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {/* AI Notes Summarizer Tab */}
            {activeTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
                    AI Notes Summarizer
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<IconUpload />}
                    onClick={() => router.push("/student/notes/create")}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.3)",
                      },
                    }}
                  >
                    Upload Document
                  </Button>
                </Box>

                {notes.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <IconBrain size={64} color="rgba(255,255,255,0.3)" />
                    <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)", mt: 2 }}>
                      No notes created yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", mb: 3 }}>
                      Upload PDFs or images to get AI-powered summaries and key insights
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<IconUpload />}
                      onClick={() => router.push("/student/notes/create")}
                    >
                      Create Your First Note
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {notes.map((note, index) => (
                      <Grid item xs={12} md={6} key={note.id}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <Card
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.1)",
                              },
                            }}
                            onClick={() => router.push(`/student/notes/${note.id}`)}
                          >
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
                                  {note.title}
                                </Typography>
                                <IconEye size={20} color="rgba(255,255,255,0.5)" />
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "rgba(255,255,255,0.7)",
                                  mb: 2,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                }}
                              >
                                {note.summary}
                              </Typography>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Chip
                                  label={note.file_type?.toUpperCase() || "PDF"}
                                  size="small"
                                  sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
                                />
                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                                  {new Date(note.created_at).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>
    </div>
  )
}
