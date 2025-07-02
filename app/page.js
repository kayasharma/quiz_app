"use client"
import { Container, Typography, Box, Button, Grid, Card, CardContent } from "@mui/material"
import { motion } from "framer-motion"
import { IconSchool, IconBrain, IconUsers, IconChartBar } from "@tabler/icons-react"
import Link from "next/link"

const features = [
  {
    icon: <IconBrain size={48} />,
    title: "AI-Powered Generation",
    description: "Generate MCQs automatically using advanced AI based on topics and difficulty levels",
  },
  {
    icon: <IconSchool size={48} />,
    title: "Teacher Dashboard",
    description: "Comprehensive dashboard for teachers to manage quizzes and track student performance",
  },
  {
    icon: <IconUsers size={48} />,
    title: "Easy Student Access",
    description: "Students can take quizzes without registration using shareable links",
  },
  {
    icon: <IconChartBar size={48} />,
    title: "Automatic Evaluation",
    description: "Instant results and detailed analytics for both teachers and students",
  },
]

export default function HomePage() {
  return (
    <div className="quiz-container">
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Box textAlign="center" mb={8}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: "bold",
                color: "white",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              AI Quiz Generator
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "rgba(255,255,255,0.9)",
                mb: 4,
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              Create intelligent quizzes in seconds with the power of AI
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href="/auth/login?role=teacher"
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                Teacher Login
              </Button>
              <Button
                component={Link}
                href="/quiz/quiz_demo"
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  color: "white",
                  borderColor: "rgba(255,255,255,0.5)",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Try Demo Quiz
              </Button>
            </Box>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box sx={{ color: "rgba(255,255,255,0.9)", mr: 2 }}>{feature.icon}</Box>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: "bold" }}>
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.8)" }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  )
}
