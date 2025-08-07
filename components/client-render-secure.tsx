"use client"
import {useEffect, useState} from "react";

interface ClientRenderSecure {
  children: React.ReactNode
}

export const ClientRenderSecure = ({children}: ClientRenderSecure) => {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, []);
  
  if (!isMounted) {
    return;
  }
  
  return (
    <>
      {children}
    </>
  )
}