import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "VOLUNTEER" | "MANAGER" | "ADMIN"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  volunteerId?: string // For volunteer users, links to their volunteer record
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasPermission: (requiredRole: UserRole) => boolean
}

// Mock users for demonstration
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    email: "voluntario@unsaac.edu",
    password: "123456",
    name: "María López",
    role: "VOLUNTEER",
    avatar: "/placeholder.svg?height=40&width=40",
    volunteerId: "1", // Links to volunteer record
  },
  {
    id: "2",
    email: "manager@unsaac.edu",
    password: "123456",
    name: "Carlos Mendoza",
    role: "MANAGER",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    email: "admin@unsaac.edu",
    password: "123456",
    name: "Ana García",
    role: "ADMIN",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const roleHierarchy: Record<UserRole, number> = {
  VOLUNTEER: 1,
  MANAGER: 2,
  ADMIN: 3,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const user = mockUsers.find((u) => u.email === email && u.password === password)

        if (user) {
          const { password: _, ...userWithoutPassword } = user
          set({ user: userWithoutPassword, isAuthenticated: true })
          return { success: true }
        }

        return { success: false, error: "Credenciales inválidas" }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
      hasPermission: (requiredRole: UserRole) => {
        const { user } = get()
        if (!user) return false
        return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
