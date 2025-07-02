import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { theme } from "@/lib/theme"
import { SessionProvider } from "@/components/session-provider"
import { AbilityProvider } from "@/components/ability-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI Quiz Generator",
  description: "AI-powered quiz generation platform for teachers and students",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SessionProvider>
            <AbilityProvider>{children}</AbilityProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
