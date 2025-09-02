"use client"

import React, {useTransition} from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/auth-store"
import { Eye, EyeOff, User, Shield, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {loginUser} from "@/features/auth/actions/login-user";
import {useRouter} from "next/navigation";

export default function LoginForm() {
  const setUser = useAuthStore((state) => state.setUser)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, starTransition] = useTransition()
  const router = useRouter()

  const demoUsers = [
    {
      email: "voluntario5@unsaac.edu",
      password: "123456",
      role: "VOLUNTEER",
      name: "María López",
      icon: User,
      color: "bg-blue-500",
      description: "Solo ve su perfil y asistencias",
    },
    {
      email: "manager2@unsaac.edu",
      password: "123456",
      role: "MANAGER",
      name: "Carlos Mendoza",
      icon: Shield,
      color: "bg-purple-500",
      description: "Crea voluntarios y registra asistencias",
    },
    {
      email: "admin@unsaac.edu",
      password: "123456",
      role: "ADMIN",
      name: "Ana García",
      icon: Crown,
      color: "bg-pink-500",
      description: "Acceso completo al sistema",
    },
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    if (pending) {
      return
    }
      
    const email = formData.email.trim().toLowerCase()
    const password = formData.password.trim()
    starTransition(async () => {
      const result = await loginUser(email, password)
      if (result.success) {
        if(!result.data) {
          toast({
            title: "Error de autenticación",
            description: "No se pudo obtener la información del usuario",
            variant: "destructive",
          })
          return
        }
        const user = {
          id: result.data.id,
          email: result.data.email,
          name: result.data.name,
          role: result.data.role,
          volunteerId: result.data.volunteerId || undefined,
          avatar: "/placeholder.svg?height=40&width=40", // Placeholder avatar
        }
        setUser(user)
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido a LUCHOS UNSAAC",
        })
        router.refresh()
      } else {
        const errorMessage = result.error || "Ocurrió un error al iniciar sesión"
        toast({
          title: "Error de autenticación",
          description: errorMessage,
          variant: "destructive",
        })
      }
      setIsLoading(false)
      setErrors({})
    })
  }

  const handleDemoLogin = (email: string, password: string) => {
    setFormData({ email, password })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          {/*<div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">*/}
          {/*  <LogIn className="h-8 w-8 text-white" />*/}
          {/*</div>*/}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            LUCHOS UNSAAC
          </h1>
          <p className="text-gray-600">Plataforma de Voluntarios Caninos</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-gray-900">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="tu-email@unsaac.edu"
                  className={`bg-white/80 border-2 ${errors.email ? "border-red-500" : "border-gray-200"} focus:border-purple-500`}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Tu contraseña"
                    className={`bg-white/80 border-2 pr-10 ${errors.password ? "border-red-500" : "border-gray-200"} focus:border-purple-500`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading || pending}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg"
              >
                {isLoading || pending ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Users */}
        <Card className="bg-white/95 backdrop-blur-md border border-gray-100 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-center text-gray-900 text-lg font-semibold">
              Usuarios de Demostración
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {demoUsers.map((user) => (
              <div
                key={user.email}
                className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-gray-100 hover:shadow-md hover:bg-white/90 transition-all duration-200 active:scale-[0.98]"
              >
                {/* Left: User Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 ${user.color} rounded-full shadow-sm`}>
                    <user.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.description}</p>
                  </div>
                </div>
                
                {/* Right: Actions */}
                <div className="flex flex-col items-end justify-between gap-1 min-w-[80px]">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-2 py-0.5 rounded-md ${
                      user.role === "ADMIN"
                        ? "bg-pink-100 text-pink-800"
                        : user.role === "MANAGER"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </Badge>
                  <Button
                    onClick={() => handleDemoLogin(user.email, user.password)}
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] px-2 border-gray-300 hover:border-purple-400 hover:text-purple-600 rounded-md"
                  >
                    Usar
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Password Hint */}
            <div className="text-center pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Contraseña para todos: <span className="font-medium">123456</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
