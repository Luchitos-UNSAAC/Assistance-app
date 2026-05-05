"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MoreVertical, Pencil, Copy, XCircle,
  MessageCircle, MessageSquare, Link2Icon, Search, MapPin, Calendar
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";

const statusMap: Record<string, string> = {
  "open": "Abierto",
  "closed": "Abierto",
}

export default function CallForVolunteersList({ calls, totalPages, currentPage }: any) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    value && value !== "ALL" ? params.set(key, value) : params.delete(key)
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/forms/call/${id}`
    navigator.clipboard.writeText(url)
    toast({ title: "Link copiado", description: "Listo para compartir." })
  }

  return (
    <div className="py-8 px-4 space-y-8">
      {/* Header: Minimalista y funcional */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Convocatorias</h1>
          <p className="text-sm text-muted-foreground text-balance">Gestiona tus voluntarios y formularios activos.</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar convocatoria..."
              className="pl-9 bg-muted/50 border-none"
              onChange={(e) => updateFilters("q", e.target.value)}
            />
          </div>
          <Select onValueChange={(v) => updateFilters("status", v)}>
            <SelectTrigger className="w-[130px] bg-muted/50 border-none">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="OPEN">Abiertas</SelectItem>
              <SelectItem value="CLOSED">Cerradas</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => router.push("/admin/calls/new")} className="bg-violet-600 hover:bg-violet-700 shadow-md">
            + Nueva
          </Button>
        </div>
      </div>

      {/* Grid: Enfocado en la lectura rápida */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {calls.map((call: any) => (
          <Card key={call.id} className="flex flex-col">
            <CardContent className="p-5 flex flex-col h-full">

              {/* Top: Status & Admin Actions */}
              <div className="flex justify-between items-start mb-4">
                <Badge variant={call.status === "OPEN" ? "secondary" : "outline"}>
                  {statusMap[call.status.toLowerCase()] || call.status.toLowerCase()}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-50 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`calls/${call.id}/edit`)}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar info
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {/* handle duplicate */}}>
                      <Copy className="mr-2 h-4 w-4" /> Duplicar
                    </DropdownMenuItem>
                    {call.status === "OPEN" && (
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="mr-2 h-4 w-4" /> Cerrar convocatoria
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Middle: Info */}
              <div className="flex-1 mb-6">
                <h3 className="font-bold text-lg leading-snug mb-2 group-hover:text-violet-600 transition-colors">
                  {call.title}
                </h3>
                <div className="space-y-1.5 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" /> {call.location || "Remoto"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Cierra el {new Date(call.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Bottom: Las 3 Acciones Principales (KISS) */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-muted">
                <Button variant="outline" size="sm" className="px-0" onClick={() => copyLink(call.id)}>
                  <Link2Icon className="h-4 w-4 mr-1.5" /> Link
                </Button>
                <Button variant="outline" size="sm" className="px-0" onClick={() => router.push(`calls/${call.id}/questions`)}>
                  <MessageCircle className="h-4 w-4 mr-1.5" /> Pregs.
                </Button>
                <Button variant="outline" size="sm" className="px-0" onClick={() => router.push(`calls/${call.id}/answers`)}>
                  <MessageSquare className="h-4 w-4 mr-1.5" /> Resps.
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginación: Compacta */}
      <div className="flex justify-center items-center gap-6 pt-6">
        <Button
          variant="ghost"
          disabled={currentPage <= 1}
          onClick={() => updateFilters("page", (currentPage - 1).toString())}
        >
          Anterior
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="ghost"
          disabled={currentPage >= totalPages}
          onClick={() => updateFilters("page", (currentPage + 1).toString())}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
