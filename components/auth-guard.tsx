"use client"

import type React from "react"

import { useAuthStore, type UserRole } from "@/lib/auth-store"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { isAuthenticated, hasPermission } = useAuthStore()

  if (!isAuthenticated) {
    return null // This will be handled by the layout
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    return (
      fallback || (
        <div className="p-4">
          <Card className="gradient-card">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
              <p className="text-gray-600">No tienes permisos suficientes para acceder a esta sección.</p>
              <p className="text-sm text-gray-500 mt-2">Se requiere rol: {requiredRole}</p>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  return <>{children}</>
}
