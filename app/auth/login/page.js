"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Container, Paper, TextField, Button, Typography, Box, Alert, Tab, Tabs } from "@mui/material"
import { motion } from "framer-motion"
import { IconUser, IconSchool } from "@tabler/icons-react"
import { useSession } from "@/components/session-provider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("teacher")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useSession()

  useEffect(() => {
    const roleParam = searchParams.get("role")
    if (roleParam) {
      setRole(roleParam)
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
          credentials: "include", // ✅ important for cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await response.json()

      if (response.ok) {
        login(data.user)
        router.push(role === "teacher" ? "/dashboard" : "/student/dashboard")
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("An error occurred during login")
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
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to your account
              </Typography>
            </Box>

            <Tabs value={role} onChange={(e, newValue) => setRole(newValue)} centered sx={{ mb: 3 }}>
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
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <Box textAlign="center" mt={2}>
              <Button variant="text" onClick={() => router.push("/auth/register")}>
                Don't have an account? Sign Up
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  )
}
