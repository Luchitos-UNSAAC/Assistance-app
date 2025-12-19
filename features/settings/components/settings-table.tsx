'use client';

import {Setting} from "@prisma/client";
import {Edit, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";

interface SettingsTableProps {
  data: Setting[];
}

export default function SettingsTable({data}: SettingsTableProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="flex flex-col align-center justify-center text-sm text-gray-500 gap-2">
        No hay configuraciones registradas.
      </div>
    );
  }

  return (
    <div>
      <Button
        variant={'outline'}
        onClick={() => router.push("/admin/settings/new")}
      >
        <Plus/>
        Agregar
      </Button>
      <div className="overflow-x-auto bg-white shadow rounded-lg w-full">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-1 text-left text-sm font-medium">
              #
            </th>
            <th className="px-4 py-1 text-left text-sm font-medium">
              Key
            </th>
            <th className="px-4 py-1 text-left text-sm font-medium">
              Value
            </th>
            <th className="px-4 py-1 text-right text-sm font-medium">
              Acciones
            </th>
          </tr>
          </thead>

          <tbody className="divide-y">
          {data.map((setting, index) => (
            <tr key={setting.id} className="hover:bg-gray-100">
              <td className="px-4 py-1 text-sm">
                {index + 1}
              </td>
              <td className="px-4 py-1 text-sm font-mono">
                {setting.key}
              </td>

              <td className="px-4 py-1 text-sm break-all">
                {setting.type === "BOOLEAN" ? (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      setting.value === "true"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {setting.value === "true" ? "Activo" : "Desactivado"}
                  </span>
                ) : (
                  <span>{setting.value}</span>
                )}
              </td>

              <td className="px-4 py-1 text-right">
                <div className="inline-flex gap-2">
                  <button
                    className="p-2 rounded hover:bg-gray-200"
                    title="Editar"
                    onClick={() => router.push(`/admin/settings/${setting.id}/edit`)}
                  >
                    <Edit className="h-4 w-4"/>
                  </button>

                  <button
                    className="p-2 rounded hover:bg-red-100 text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4"/>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>

  );
}
