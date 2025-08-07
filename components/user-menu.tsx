"use client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/auth-store"
import { LogOut, User, Settings, Shield, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {useRouter} from "next/navigation";
import {Separator} from "@/components/ui/separator";

export default function UserMenu() {
  const { user, logout } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()

  if (!user) return null

  const handleLogout = () => {
    logout()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    })
  }
  
  const handleProfileClick = () => {
    router.push("/profile")
  }
  
  const handleSettingsClick = () => {
    router.push("/settings")
  }

  const getRoleIcon = () => {
    switch (user.role) {
      case "ADMIN":
        return <Crown className="h-3 w-3" />
      case "MANAGER":
        return <Shield className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const getRoleColor = () => {
    switch (user.role) {
      case "ADMIN":
        return "bg-pink-100 text-pink-800"
      case "MANAGER":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white border-2 border-purple-200 shadow-2xl" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <Badge variant="secondary" className={`text-xs ${getRoleColor()}`}>
                <span className="flex items-center space-x-1">
                  {getRoleIcon()}
                  <span>{user.role}</span>
                </span>
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer hover:bg-purple-50"
          onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        {/*<DropdownMenuItem*/}
        {/*  className="cursor-pointer hover:bg-purple-50"*/}
        {/*  onClick={handleSettingsClick}>*/}
        {/*  <Settings className="mr-2 h-4 w-4" />*/}
        {/*  <span>Configuración</span>*/}
        {/*</DropdownMenuItem>*/}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-red-50 text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
        
        <Separator className="my-2" />
      {/*  Version app */}
        <div className="px-4 py-2 text-xs text-gray-400 text-center">
          <span>Versión 1.0.0</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
