"use client"
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAuthStore} from "@/lib/auth-store";

export const LogoutComponent = () => {
  const { logout } = useAuthStore()
  const router = useRouter()
  useEffect(() => {
    logout()
    router.push("/")
  }, []);
  return null;
}