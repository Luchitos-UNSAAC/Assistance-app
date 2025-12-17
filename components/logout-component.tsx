"use client"

import {useEffect, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useAuthStore} from "@/lib/auth-store";
import {LogoutCookies} from "@/lib/logout-cookies";

export const LogoutComponent = () => {
  const { logout } = useAuthStore()
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const logoutCookies = () => {
    if (pending) {
      return
    }
    startTransition( async()=> {
      await LogoutCookies()
      router.push("/auth/login")
    })
  }

  useEffect(() => {
    logout()
    logoutCookies()
  }, []);
  return null;
}
