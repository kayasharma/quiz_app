"use client"
import { createContext, useContext } from "react"
import { createMongoAbility } from "@casl/ability"
import { useSession } from "./session-provider"

const AbilityContext = createContext()

export function AbilityProvider({ children }) {
  const { user } = useSession()

  const ability = createMongoAbility(defineRulesFor(user))

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
}

export function useAbility() {
  const context = useContext(AbilityContext)
  if (!context) {
    throw new Error("useAbility must be used within an AbilityProvider")
  }
  return context
}

function defineRulesFor(user) {
  const rules = []

  if (user) {
    if (user.role === "teacher") {
      rules.push(
        { action: "manage", subject: "Quiz", conditions: { teacherId: user.id } },
        { action: "read", subject: "Student" },
        { action: "manage", subject: "QuizResult", conditions: { teacherId: user.id } },
      )
    } else if (user.role === "student") {
      rules.push(
        { action: "read", subject: "Quiz" },
        { action: "create", subject: "QuizAttempt" },
        { action: "read", subject: "QuizResult", conditions: { studentId: user.id } },
      )
    }
  } else {
    // Public access for taking quizzes
    rules.push({ action: "read", subject: "Quiz" }, { action: "create", subject: "QuizAttempt" })
  }

  return rules
}
