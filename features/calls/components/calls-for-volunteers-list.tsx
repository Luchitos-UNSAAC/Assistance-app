"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {Pencil, Copy, XCircle, MessageCircle, MessageSquare, Link2Icon} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import AuthGuard from "@/components/auth-guard";

type CallForVolunteers = {
  id: string
  title: string
  location: string | null
  modality: string
  deadline: string
  status: string
}

interface CallForVolunteersListProps {
  calls: CallForVolunteers[]
}

export default function CallForVolunteersList({ calls }: CallForVolunteersListProps) {
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const {toast} = useToast()
  const router = useRouter()

  const handleClose = async (id: string) => {
    if (!confirm("¿Seguro que deseas cerrar esta convocatoria?")) return


    await fetch(`/api/calls/${id}/close`, {
      method: "PUT",
    })

    router.refresh()
  }

  const handleDuplicate = async (id: string) => {
    const res = await fetch(`/api/calls/${id}/duplicate`, {
      method: "POST",
    })

    if (res.ok) {
      const newCall = await res.json()
      router.push(`/calls/${newCall.id}/edit`)
    }
  }

  const copyLink = (callId: string) => {
    let url = "";
    const isLocal = window.location.hostname === "localhost";
    if (!isLocal) {
      url = "https://assistance-app-two.vercel.app/" + `forms/call/${callId}`
    } else {
      url = "http://localhost:3001/" + `forms/call/${callId}`
    }
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copiado al portapapeles",
      description: "Envía este link a los voluntarios para que puedan aplicar.",
    })
  }

  return (
    <AuthGuard requiredRole="ADMI">
      <div className="max-w-5xl mx-auto space-y-6 px-3 sm:px-4">
        <div className="pt-20 pb-20">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            Convocatorias
            <Button
              onClick={() => router.push("/calls/new")}
              className="ml-4 px-3 py-1 rounded-full font-medium bg-violet-400 hover:bg-violet-300 text-white transition"
              size="sm"
            >
              +
            </Button>
          </h2>
          {calls.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {calls.map((call) => (
                <Card
                  key={call.id}
                  className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold line-clamp-1">
                      {call.title}
                    </CardTitle>
                    <Badge
                      variant={
                        call.status === "OPEN"
                          ? "default"
                          : call.status === "CLOSED"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {call.status}
                    </Badge>
                  </CardHeader>

                  <CardContent className="space-y-2 text-sm text-gray-600">
                    <p>📍 {call.location ?? "No especificado"}</p>
                    <p>🖥️ Modalidad: {call.modality}</p>
                    <p>
                      ⏳ Deadline:{" "}
                      <span className="font-medium text-gray-800">
                    {new Date(call.deadline).toLocaleDateString()}
                  </span>
                    </p>

                    <div className="pt-3 flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyLink(call.id)}
                      >
                        <Link2Icon className="w-4 h-4 mr-1" />
                        Copiar link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/calls/${call.id}/edit`)}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicate(call.id)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Duplicar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/calls/${call.id}/questions`)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Preguntas
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/calls/${call.id}/answers`)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Respuestas
                      </Button>
                      {call.status === "OPEN" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleClose(call.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cerrar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No hay convocatorias disponibles.
            </p>
          )}
          {/* Paginación */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              ⬅️ Anterior
            </Button>
            <span className="text-sm text-gray-600">
          Página {page} de {totalPages}
        </span>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Siguiente ➡️
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
