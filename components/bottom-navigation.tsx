"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Calendar, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"

const navigation = [
  { name: "Inicio", href: "/", icon: Home, requiredRole: "VOLUNTEER" as const },
  { name: "Mi Perfil", href: "/profile", icon: Users, requiredRole: "VOLUNTEER" as const, volunteerOnly: true },
  { name: "Voluntarios", href: "/volunteers", icon: Users, requiredRole: "MANAGER" as const },
  { name: "Asistencias", href: "/attendance", icon: Calendar, requiredRole: "MANAGER" as const },
]

export default function BottomNavigation() {
  const pathname = usePathname()
  const { hasPermission, user } = useAuthStore()

  const visibleNavigation = navigation.filter((item) => {
    if (!hasPermission(item.requiredRole)) return false

    // Show "Mi Perfil" only for volunteers, "Voluntarios" only for managers+
    if (item.volunteerOnly && user?.role !== "VOLUNTEER") return false
    if (!item.volunteerOnly && item.requiredRole === "MANAGER" && user?.role === "VOLUNTEER") return false

    return true
  })

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t-2 border-white/20 px-4 py-2 shadow-2xl">
      <nav className="flex justify-around">
        {visibleNavigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50",
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
