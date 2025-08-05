"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/auth-store"
import LoginForm from "@/components/login-form"
import BottomNavigation from "@/components/bottom-navigation"
import UserMenu from "@/components/user-menu"

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate checking authentication state
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <>
      {/* Header with user menu */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              LUCHOS UNSAAC
            </h1>
            <p className="text-xs text-gray-600">Bienvenido, {user?.name}</p>
          </div>
          <UserMenu />
        </div>
      </div>

      {/* Main content with top padding */}
      <main className="pt-20 pb-20">{children}</main>

      {/* Bottom navigation */}
      <BottomNavigation />
    </>
  )
}
