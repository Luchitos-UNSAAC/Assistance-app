"use client"

import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {
  MoreVertical, Pencil, Copy, XCircle,
  MessageCircle, MessageSquare, Link2Icon, Search, MapPin, Calendar, Plus
} from "lucide-react"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {useToast} from "@/hooks/use-toast"
import {cn} from "@/lib/utils"

// Corregido: El mapeo ahora refleja estados reales
const statusConfig: Record<string, { label: string, variant: "default" | "secondary" | "outline" }> = {
  "open": {label: "Abierto", variant: "secondary"}, // Secondary usa el violeta suave del tema
  "closed": {label: "Cerrado", variant: "outline"},
}

export default function CallForVolunteersList({calls, totalPages, currentPage}: any) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const {toast} = useToast()

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    value && value !== "ALL" ? params.set(key, value) : params.delete(key)
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/forms/call/${id}`
    navigator.clipboard.writeText(url)
    toast({title: "Enlace copiado", description: "Ya puedes compartir la convocatoria."})
  }

  return (
    <div className="py-6 px-4 space-y-8">
      {/* Header: Adaptado al sistema de diseño Slate */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Convocatorias</h1>
          <p className="text-sm text-muted-foreground font-medium">Impulsa el impacto: gestiona formularios y nuevos
            talentos.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"/>
            <Input
              placeholder="Buscar..."
              className="pl-9 bg-card/50 border-border/50 focus-visible:ring-primary/20"
              onChange={(e) => updateFilters("q", e.target.value)}
            />
          </div>

          <Select onValueChange={(v) => updateFilters("status", v)}>
            <SelectTrigger className="w-[130px] bg-card/50 border-border/50">
              <SelectValue placeholder="Estado"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="OPEN">Abiertas</SelectItem>
              <SelectItem value="CLOSED">Cerradas</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => router.push("/admin/calls/new")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4 mr-2"/> Nueva
          </Button>
        </div>
      </div>

      {/* Grid: Glassmorphism Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {calls.map((call: any) => {
          const status = statusConfig[call.status.toLowerCase()] || {label: call.status, variant: "outline"};

          return (
            <Card key={call.id}
                  className="group relative flex flex-col bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="p-6 flex flex-col h-full">

                {/* Top: Status & Admin Actions */}
                <div className="flex justify-between items-start mb-6">
                  <Badge variant={status.variant} className={cn(
                    "font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider",
                    call.status === "OPEN" ? "bg-primary/10 text-primary border-primary/20" : ""
                  )}>
                    {status.label}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full hover:bg-accent">
                        <MoreVertical className="h-4 w-4 text-muted-foreground"/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-popover/95 backdrop-blur-md">
                      <DropdownMenuItem onClick={() => router.push(`calls/${call.id}/edit`)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4 text-muted-foreground"/> Editar info
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {/* handle duplicate */
                      }} className="cursor-pointer">
                        <Copy className="mr-2 h-4 w-4 text-muted-foreground"/> Duplicar
                      </DropdownMenuItem>
                      {call.status === "OPEN" && (
                        <>
                          <div className="h-px bg-border my-1"/>
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                            <XCircle className="mr-2 h-4 w-4"/> Cerrar convocatoria
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Middle: Content */}
                <div className="flex-1 space-y-3">
                  <h3
                    className="font-bold text-xl tracking-tight leading-tight group-hover:text-primary transition-colors">
                    {call.title}
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4 text-primary/60"/>
                      <span className="truncate">{call.location || "Remoto"}</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="h-4 w-4 text-primary/60"/>
                      <span>Cierra el {new Date(call.deadline).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long'
                      })}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Actions Bar */}
                <div className="grid grid-cols-3 gap-2 mt-8 pt-4 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] font-bold hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => copyLink(call.id)}
                  >
                    <Link2Icon className="h-3.5 w-3.5 mr-1.5"/> LINK
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] font-bold hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => router.push(`calls/${call.id}/questions`)}
                  >
                    <MessageCircle className="h-3.5 w-3.5 mr-1.5"/> PREGS.
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] font-bold hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => router.push(`calls/${call.id}/answers`)}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5"/> RESPS.
                  </Button>
                </div>

              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination: Refinada */}
      <div className="flex justify-center items-center gap-4 pt-8">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-5 border-border/50 hover:bg-accent"
          disabled={currentPage <= 1}
          onClick={() => updateFilters("page", (currentPage - 1).toString())}
        >
          Anterior
        </Button>
        <div
          className="flex items-center justify-center h-8 w-12 rounded-lg bg-primary/10 text-primary text-sm font-bold">
          {currentPage}
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">de {totalPages}</span>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-5 border-border/50 hover:bg-accent"
          disabled={currentPage >= totalPages}
          onClick={() => updateFilters("page", (currentPage + 1).toString())}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
