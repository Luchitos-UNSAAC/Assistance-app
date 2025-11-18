import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AuthWrapper from "@/components/auth-wrapper"
import BottomNavigation from "@/components/bottom-navigation"
import { ClientRenderSecure } from "@/components/client-render-secure";
import DeleteConfirmationModal from "@/components/delete-confirm-modal";

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <ClientRenderSecure>
              {children}
              <BottomNavigation />
              <DeleteConfirmationModal />
            </ClientRenderSecure>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
