'use client'

import Link from "next/link";
import {usePathname} from "next/navigation";

const links = [
  { href: "/admin/assistances", label: "Asistencias" },
  { href: "/admin/generate-reports", label: "Generar Reportes" },
]

export const HeaderAdmin = () => {
  const pathname = usePathname()
  const activeLink = links.find(link => link.href === pathname)

  return (
    <div className="mb-1">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>
      <p className="text-gray-600">Gestiona voluntarios, asistencias y reportes</p>
    </div>
  )
}
