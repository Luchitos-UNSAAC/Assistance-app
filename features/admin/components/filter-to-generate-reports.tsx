"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Download, RefreshCw, X } from "lucide-react"

export function FilterToGenerateReports() {
  // const [startDate, setStartDate] = useState<string>("")
  // const [endDate, setEndDate] = useState<string>("")
  // const [volunteerStatus, setVolunteerStatus] = useState<string>("all")
  // const [isBusy, setIsBusy] = useState(false)
  // const { toast } = useToast()
  //
  // const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD for max attribute
  //
  // // validation: if both provided, start <= end
  // const isValidRange = useMemo(() => {
  //   if (!startDate || !endDate) return true // allow open ranges
  //   const s = new Date(startDate)
  //   const e = new Date(endDate)
  //   return !isNaN(s.getTime()) && !isNaN(e.getTime()) && s.getTime() <= e.getTime()
  // }, [startDate, endDate])
  //
  // const activeFilters = useMemo(() => {
  //   const arr: { key: string; label: string; clear: () => void }[] = []
  //   if (startDate) arr.push({ key: "start", label: `Desde: ${startDate}`, clear: () => setStartDate("") })
  //   if (endDate) arr.push({ key: "end", label: `Hasta: ${endDate}`, clear: () => setEndDate("") })
  //   if (volunteerStatus !== "all")
  //     arr.push({
  //       key: "vol",
  //       label: volunteerStatus === "active" ? "Voluntarios: Activos" : "Voluntarios: Inactivos",
  //       clear: () => setVolunteerStatus("all"),
  //     })
  //   return arr
  // }, [startDate, endDate, volunteerStatus])
  //
  // const resetFilters = () => {
  //   setStartDate("")
  //   setEndDate("")
  //   setVolunteerStatus("all")
  // }
  //
  // const handleDownload = async () => {
  //   // Prevent download on invalid range
  //   if (!isValidRange) {
  //     toast({ title: "Rango inválido", description: "La fecha de inicio debe ser anterior o igual a la fecha final.", variant: "destructive" })
  //     return
  //   }
  //
  //   setIsBusy(true)
  //   try {
  //     const payload = {
  //       startDate: startDate || null, // "YYYY-MM-DD" or null
  //       endDate: endDate || null,
  //       volunteerStatus, // 'all' | 'active' | 'inactive'
  //     }
  //
  //     const res = await fetch("/api/reports/attendances", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //       credentials: "same-origin",
  //     })
  //
  //     if (!res.ok) {
  //       const text = await res.text()
  //       throw new Error(text || "Error generating report")
  //     }
  //
  //     const blob = await res.blob()
  //     let filename = `asistencias-${new Date().toISOString().slice(0, 10)}.xlsx`
  //     const disposition = res.headers.get("content-disposition")
  //     if (disposition) {
  //       const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/)
  //       if (match && match[1]) filename = decodeURIComponent(match[1])
  //     }
  //
  //     const url = window.URL.createObjectURL(blob)
  //     const a = document.createElement("a")
  //     a.href = url
  //     a.download = filename
  //     document.body.appendChild(a)
  //     a.click()
  //     a.remove()
  //     window.URL.revokeObjectURL(url)
  //
  //     toast({ title: "Descarga iniciada", description: filename })
  //   } catch (err: any) {
  //     toast({ title: "Error", description: err?.message || "No se pudo generar el reporte.", variant: "destructive" })
  //   } finally {
  //     setIsBusy(false)
  //   }
  // }
  //
  // return (
  //   <div className="p-4">
  //     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  //       <div>
  //         <h2 className="text-2xl font-bold">Reportes — Asistencias</h2>
  //         <p className="text-sm text-gray-500 mt-1">Filtra por rango de fechas y estado del voluntario.</p>
  //       </div>
  //     </div>
  //
  //     <div className="mt-4">
  //       <Card>
  //         <CardContent>
  //           {/* Grid: responsive */}
  //           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end mt-2">
  //             {/* Fecha inicio */}
  //             <div>
  //               <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">Fecha inicio</label>
  //               <input
  //                 id="startDate"
  //                 type="date"
  //                 className={`w-full rounded-md border px-3 py-2 ${isValidRange ? "focus:ring-2 focus:ring-blue-400" : "border-red-400"}`}
  //                 value={startDate}
  //                 onChange={(e) => setStartDate(e.target.value)}
  //                 max={today}
  //                 aria-invalid={!isValidRange}
  //                 aria-describedby={!isValidRange ? "date-error" : undefined}
  //                 disabled={isBusy}
  //               />
  //             </div>
  //
  //             {/* Fecha fin */}
  //             <div>
  //               <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">Fecha final</label>
  //               <input
  //                 id="endDate"
  //                 type="date"
  //                 className={`w-full rounded-md border px-3 py-2 ${isValidRange ? "focus:ring-2 focus:ring-blue-400" : "border-red-400"}`}
  //                 value={endDate}
  //                 onChange={(e) => setEndDate(e.target.value)}
  //                 max={today}
  //                 aria-invalid={!isValidRange}
  //                 aria-describedby={!isValidRange ? "date-error" : undefined}
  //                 disabled={isBusy}
  //               />
  //             </div>
  //
  //             {/* Estado voluntario */}
  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-2">Voluntario</label>
  //               <Select value={volunteerStatus} onValueChange={setVolunteerStatus} disabled={isBusy}>
  //                 <SelectTrigger className="w-full">
  //                   <SelectValue placeholder="Todos" />
  //                 </SelectTrigger>
  //                 <SelectContent>
  //                   <SelectItem value="all">Todos</SelectItem>
  //                   <SelectItem value="active">Activos</SelectItem>
  //                   <SelectItem value="inactive">Inactivos</SelectItem>
  //                 </SelectContent>
  //               </Select>
  //             </div>
  //           </div>
  //
  //           {/* Validation message */}
  //           {!isValidRange && (
  //             <p id="date-error" className="mt-2 text-sm text-red-600">La fecha inicio debe ser anterior o igual a la fecha final.</p>
  //           )}
  //
  //           {/* Active filter chips */}
  //           <div className="mt-3 flex flex-wrap gap-2">
  //             {activeFilters.length === 0 ? (
  //               <span className="text-sm text-gray-500">No hay filtros activos</span>
  //             ) : (
  //               activeFilters.map((f) => (
  //                 <Button
  //                   key={f.key}
  //                   onClick={f.clear}
  //                   variant='default'
  //                   aria-label={`Eliminar filtro ${f.label}`}
  //                   disabled={isBusy}
  //                 >
  //                   <span className="text-sm">{f.label}</span>
  //                   <X className="h-3 w-3" />
  //                 </Button>
  //               ))
  //             )}
  //           </div>
  //
  //           {/* Actions */}
  //           <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
  //             <div className="flex gap-2 w-full sm:w-auto sm:flex-row flex-col">
  //               <Button
  //                 onClick={handleDownload}
  //                 disabled={isBusy || !isValidRange}
  //                 variant='default'
  //                 aria-label="Descargar reporte de asistencias"
  //               >
  //                 {isBusy ? (
  //                   <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
  //                     <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
  //                     <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
  //                   </svg>
  //                 ) : (
  //                   <Download className="h-4 w-4" />
  //                 )}
  //                 <span>{isBusy ? "Generando..." : "Descargar Excel"}</span>
  //               </Button>
  //
  //               <Button
  //                 onClick={resetFilters}
  //                 className="bg-gray-200 hover:bg-gray-300 text-gray-700"
  //                 aria-label="Restablecer filtros"
  //                 disabled={isBusy}
  //               >
  //                 <RefreshCw className="h-4 w-4" />
  //                 Reset
  //               </Button>
  //             </div>
  //
  //             <div className="mt-2 sm:mt-0 sm:ml-auto text-sm text-gray-500">
  //               <strong>Nota:</strong> Enviaré las fechas en formato ISO (YYYY-MM-DD).
  //             </div>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   </div>
  // )
  return (
    <div className="">
      Hello world
    </div>
  )
}
