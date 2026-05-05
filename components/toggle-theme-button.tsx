"use client"

import * as React from "react"
import {Moon, Sun} from "lucide-react"
import {useTheme} from "next-themes"

import {Button} from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {cn} from "@/lib/utils"

export function ModeToggle() {
  const {setTheme} = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost" // Cambiado de 'outline' a 'ghost' para un look más limpio
          size="icon"
          className={cn(
            "h-9 w-9 rounded-full",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:ring-primary/20 transition-all duration-300"
          )}
        >
          <Sun
            className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500"/>
          <Moon
            className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-violet-400"/>
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="bg-popover/90 backdrop-blur-md border-border/50 rounded-xl"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground rounded-lg"
        >
          <Sun className="mr-2 h-4 w-4 text-orange-500"/>
          <span className="font-medium">Claro</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground rounded-lg"
        >
          <Moon className="mr-2 h-4 w-4 text-violet-400"/>
          <span className="font-medium">Oscuro</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground rounded-lg"
        >
          <span className="mr-2 text-xs font-bold text-muted-foreground italic">Sys</span>
          <span className="font-medium">Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
