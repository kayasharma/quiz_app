"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Container, Paper, TextField, Button, Typography, Box, Alert, Tab, Tabs } from "@mui/material"
import { motion } from "framer-motion"
import { IconUser, IconSchool } from "@tabler/icons-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "teacher",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/auth/login?message=Registration successful")
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (error) {
      setError("An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="quiz-container">
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
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join our AI-powered quiz platform
              </Typography>
            </Box>

            <Tabs
              value={formData.role}
              onChange={(e, newValue) => setFormData({ ...formData, role: newValue })}
              centered
              sx={{ mb: 3 }}
            >
              <Tab value="teacher" label="Teacher" icon={<IconSchool size={20} />} iconPosition="start" />
              <Tab value="student" label="Student" icon={<IconUser size={20} />} iconPosition="start" />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                required
                variant="outlined"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <Box textAlign="center" mt={2}>
              <Button variant="text" onClick={() => router.push("/auth/login")}>
                Already have an account? Sign In
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  )
}
