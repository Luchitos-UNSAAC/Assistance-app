import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AuthWrapper from "@/components/auth-wrapper"
import BottomNavigation from "@/components/bottom-navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LUCHOS UNSAAC - Plataforma de Voluntarios Caninos",
  description: "Gestión de voluntarios para el cuidado canino en UNSAAC",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <AuthWrapper>{children}</AuthWrapper>
            <BottomNavigation />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
