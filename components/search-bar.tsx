"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchBar({
                            value,
                            onChange,
                            placeholder,
                          }: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 z-10 pointer-events-none" />
      <Input
        placeholder={placeholder || "Buscar..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-white/80 backdrop-blur-sm border-white/20 text-gray-900 text-sm"
      />
    </div>
  )
}
