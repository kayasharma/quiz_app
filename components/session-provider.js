"use client"
import { createContext, useContext, useState, useEffect } from "react"

const SessionContext = createContext()

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()

    // Set up periodic session check every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000)

    return () => clearInterval(interval)
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

  const login = (userData) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
      setUser(null)
    }
  }

  return (
    <SessionContext.Provider value={{ user, login, logout, loading, checkSession }}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
