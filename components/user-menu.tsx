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
import { LogOut, User, Shield, Crown, UserCircle, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface UserMenuProps {
  justImage?: boolean;
}

export default function UserMenu({ justImage = false }: UserMenuProps) {
  const { user, logout } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()

  if (!user) return null

  const handleLogout = () => {
    logout()
    toast({ title: "Sesión cerrada", description: "Vuelve pronto." })
    router.push('/auth/login')
  }

  const isAdmin = useAuthStore((state) => state.hasPermission("ADMIN"))

  // Mapeo semántico de ROLES (KISS)
  const roleConfig: Record<string, { label: string, icon: any, className: string }> = {
    ADMIN: {
      label: 'Admin',
      icon: Crown,
      className: "bg-primary/10 text-primary border-primary/20"
    },
    MANAGER: {
      label: 'Encargado',
      icon: Shield,
      className: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200/50"
    },
    USER: {
      label: 'Voluntario',
      icon: User,
      className: "bg-secondary text-secondary-foreground"
    }
  }

  const currentRole = roleConfig[user.role] || roleConfig.USER
  const IconRole = currentRole.icon

  const UserAvatar = () => (
    <Avatar className="h-10 w-10 border-2 border-border/50 shadow-sm">
      <AvatarImage src={user.avatar || `https://robohash.org/${user.id}?set=set4`} alt={user.name} />
      <AvatarFallback className="bg-gradient-to-br from-primary to-violet-400 text-primary-foreground text-xs font-bold">
        {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )

  if (justImage) return <UserAvatar />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all">
          <UserAvatar />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 bg-popover/95 backdrop-blur-md border-border shadow-xl rounded-xl"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground leading-none">{user.name}</p>
              <Badge variant="outline" className={cn("text-[10px] px-2 py-0 h-5 font-bold uppercase tracking-wider", currentRole.className)}>
                <IconRole className="mr-1 h-3 w-3" />
                {currentRole.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate font-medium">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="p-1">
          <DropdownMenuItem onClick={() => router.push("/profile")} className="rounded-lg cursor-pointer">
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Mi Perfil</span>
          </DropdownMenuItem>

          {isAdmin && (
            <DropdownMenuItem
              onClick={() => router.push("/admin/volunteers")}
              className="rounded-lg cursor-pointer bg-primary/5 text-primary focus:bg-primary/10 focus:text-primary font-semibold"
            >
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Panel de Control</span>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="p-1">
          <DropdownMenuItem
            onClick={handleLogout}
            className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </div>

        <div className="p-3 bg-muted/30 mt-1 rounded-b-lg border-t border-border/50">
          <p className="text-[10px] text-center font-bold text-muted-foreground tracking-widest uppercase italic">
            Versión 1.0.0 — LUCHOS
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
