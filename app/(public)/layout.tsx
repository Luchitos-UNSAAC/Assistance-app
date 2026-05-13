import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import PublicFooter from "@/components/public-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LUCHOS UNSAAC - Formulario",
  description: "Gestión de voluntarios para el cuidado canino en UNSAAC",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <PublicFooter />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
