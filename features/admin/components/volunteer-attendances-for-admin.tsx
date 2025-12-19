"use client"

import {useMemo, useState} from "react"
import {format} from "date-fns"
import {AttendanceStatus} from "@prisma/client"
import {VolunteerWithAttendancesAndScore} from "@/features/admin/actions/get-attendances-by-volunteer-id-for-admin"
import {Badge} from "@/components/ui/badge"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label";

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: "Presente",
  LATE: "Tarde",
  ABSENT: "Ausente",
  JUSTIFIED: "Justificado",
}

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: "bg-green-100 text-green-800",
  LATE: "bg-yellow-100 text-yellow-800",
  ABSENT: "bg-red-100 text-red-800",
  JUSTIFIED: "bg-gray-100 text-gray-800",
}

interface Props {
  data: VolunteerWithAttendancesAndScore
}

type AttendanceScoreKey = keyof VolunteerWithAttendancesAndScore["scoreAttendances"]

export default function VolunteerAttendancesForAdmin({data}: Props) {
  const {volunteer, scoreAttendances} = data

  const [statusFilter, setStatusFilter] =
    useState<AttendanceStatus | "ALL">("ALL")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const filteredAttendances = useMemo(() => {
    return volunteer.attendances.filter((a) => {
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false
      if (fromDate && new Date(a.date) < new Date(fromDate)) return false
      if (toDate && new Date(a.date) > new Date(toDate)) return false
      return true
    })
  }, [volunteer.attendances, statusFilter, fromDate, toDate])

  return (
    <div className="space-y-2 w-full mt-3">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{volunteer.name}</h1>
        <p className="text-sm text-gray-500">{volunteer.email}</p>
      </div>

      {/* Score */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(scoreAttendances) as AttendanceScoreKey[]).map((key) => (
          <div
            key={key}
            className="rounded-xl border bg-gray-50 p-2 text-center"
          >
            <p className="text-xs text-gray-500">{STATUS_LABELS[key]}</p>
            <p className="text-2xl font-bold">{scoreAttendances[key]}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-end">
        <div className='flex flex-col gap-1'>
          <Label>
            Estado
          </Label>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as AttendanceStatus | "ALL")
            }
          >
            <option value="ALL">Todos</option>
            <option value="PRESENT">Presente</option>
            <option value="LATE">Tarde</option>
            <option value="ABSENT">Ausente</option>
          </select>
        </div>

        <div>
          <Label>
            Inicio
          </Label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div>
          <Label>
            Fin
          </Label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setStatusFilter("ALL")
            setFromDate("")
            setToDate("")
          }}
        >
          Limpiar
        </Button>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto rounded-xl border">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">
              #
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium">
              Fecha
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium">
              Grupo
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium">
              Observación
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium">
              Fuente
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium">
              Registrado
            </th>
          </tr>
          </thead>

          <tbody className="divide-y">
          {filteredAttendances.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                No hay asistencias para los filtros seleccionados
              </td>
            </tr>
          ) : (
            filteredAttendances.map((a, index) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  {format(new Date(a.date), "yyyy-MM-dd")}
                </td>

                <td className="px-4 py-3">
                  <Badge className={STATUS_COLORS[a.status]}>
                    {STATUS_LABELS[a.status]}
                  </Badge>
                </td>

                <td className="px-4 py-3 text-sm">
                  {"-"}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600 max-w-[300px] truncate">
                  {"-"}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {a.source}
                </td>

                <td className="px-4 py-3 text-sm text-gray-500">
                  {format(new Date(a.createdAt), "yyyy-MM-dd HH:mm")}
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
