"use client"

import UserMenu from "@/components/user-menu";
import type React from "react";
import {useAuthStore} from "@/lib/auth-store";
import {cn} from "@/lib/utils";

export const AdminNavbar = () => {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <nav className={cn(
      "fixed top-0 right-0 z-40", // Bajamos a z-40 (menor que el 60 del sidebar)
      "left-0 md:left-52",        // En escritorio, empieza donde termina el sidebar
      "bg-background/80 backdrop-blur-lg border-b border-border/20 px-4 py-2.5"
    )}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            LUCHOS UNSAAC
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            Bienvenido, {user?.name}
          </p>
        </div>
        <UserMenu justImage={false} />
      </div>
    </nav>
  );
};
