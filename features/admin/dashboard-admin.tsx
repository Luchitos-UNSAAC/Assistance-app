"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Download, RefreshCw } from "lucide-react"

export function DashboardAdmin() {
  const [day, setDay] = useState<string>("all")
  const [month, setMonth] = useState<string>("all")
  const [year, setYear] = useState<string>("all")
  const [volunteerStatus, setVolunteerStatus] = useState<string>("all")
  const [isBusy, setIsBusy] = useState(false)
  const { toast } = useToast()
  
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }).map((_, i) => String(currentYear - i))
  
  const months = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ]
  
  const days = Array.from({ length: 31 }).map((_, i) => String(i + 1))
  
  const resetFilters = () => {
    setDay("all")
    setMonth("all")
    setYear("all")
    setVolunteerStatus("all")
  }
  
  const handleDownload = async () => {
    setIsBusy(true)
    try {
      const payload = {
        day: day === "all" ? null : Number(day),
        month: month === "all" ? null : Number(month),
        year: year === "all" ? null : Number(year),
        volunteerStatus: volunteerStatus, // 'all' | 'active' | 'inactive'
      }
      
      const res = await fetch("/api/reports/attendances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      })
      
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Error generating report")
      }
      
      const blob = await res.blob()
      
      // Try to parse filename from headers
      let filename = `asistencias-${new Date().toISOString().slice(0, 10)}.xlsx`
      const disposition = res.headers.get("content-disposition")
      if (disposition) {
        const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/) // RFC-compliant attempt
        if (match && match[1]) filename = decodeURIComponent(match[1])
      }
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      
      toast({ title: "Descarga iniciada", description: filename })
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "No se pudo generar el reporte.", variant: "destructive" })
    } finally {
      setIsBusy(false)
    }
  }
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Reportes — Asistencias</h2>
      
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Día */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Día</label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los días</SelectItem>
                  {days.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Mes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los meses</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Año */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Voluntario: activo/inactivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Voluntario</label>
              <Select value={volunteerStatus} onValueChange={setVolunteerStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <Button onClick={handleDownload} disabled={isBusy} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {isBusy ? "Generando..." : "Descargar Excel"}
            </Button>
            
            <Button onClick={resetFilters} variant="ghost" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            
            <div className="ml-auto text-sm text-gray-500">
              <strong>Nota:</strong> Si necesitas filtrado por rangos o por voluntario específico puedo añadirlo.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
