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
      {/* Add links /admin/assistances or /generate-reports */}
      {/*<div className="mt-4 flex gap-2">*/}
      {/*  {links.map((link) => (*/}
      {/*    <Link*/}
      {/*      key={link.href}*/}
      {/*      href={link.href}*/}
      {/*      className={`px-4 py-2 text-sm md:text-lg rounded-md font-medium ${activeLink?.href === link.href ? 'text-purple-800 bg-purple-100' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}*/}
      {/*    >*/}
      {/*      {link.label}*/}
      {/*    </Link>*/}
      {/*  ))}*/}
      {/*</div>*/}
    </div>
  )
}
