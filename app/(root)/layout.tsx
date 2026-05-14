import type React from "react"
import type {Metadata} from "next"
import {ThemeProvider} from "@/components/theme-provider"
import {Toaster} from "@/components/ui/toaster"
import BottomNavigation from "@/components/bottom-navigation"
import {ClientRenderSecure} from "@/components/client-render-secure";
import DeleteConfirmationModal from "@/components/delete-confirm-modal";
import {Navbar} from "@/components/navbar";
import {needChangePassword} from "@/features/auth/actions/need-change-password";
import {ChangePasswordModal} from "@/features/auth/components/change-password-modal";

export const metadata: Metadata = {
  title: "LUCHOS UNSAAC - Plataforma de Voluntarios Caninos",
  description: "Gestión de voluntarios para el cuidado canino en UNSAAC",
}

export default async function RootLayout({
                                           children,
                                         }: {
  children: React.ReactNode
}) {
  const itNeedChangePassword = await needChangePassword()
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <ClientRenderSecure>
          <Navbar/>
          <main>{children}</main>
          <BottomNavigation/>
          <DeleteConfirmationModal/>
          {itNeedChangePassword.data && (
            <ChangePasswordModal
              isOpen={itNeedChangePassword.data}
              user={itNeedChangePassword.user}
            />
          )}
        </ClientRenderSecure>
      </div>
      <Toaster/>
    </ThemeProvider>
  )
}
