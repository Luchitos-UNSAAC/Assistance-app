"use client"

import UserMenu from "@/components/user-menu";
import type React from "react";
import {useAuthStore} from "@/lib/auth-store";

export const Navbar = () => {
  const {user} = useAuthStore()
  if (!user) {
    return null
  }
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            LUCHOS UNSAAC
          </h1>
          <p className="text-xs text-gray-600">Bienvenido, {user?.name}</p>
        </div>
        <UserMenu justImage={false} />
      </div>
    </div>
  )
}
