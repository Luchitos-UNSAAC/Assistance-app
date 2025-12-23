'use client';

import { Setting } from "@prisma/client";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SettingsTableProps {
  data: Setting[];
}

export default function SettingsTable({ data }: SettingsTableProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-sm text-gray-500 gap-2">
        No hay configuraciones registradas.
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/settings/new")}
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar configuración
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/settings/new")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </div>

      {/* ===== Desktop table ===== */}
      <div className="hidden md:block overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium">#</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Key</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Value</th>
            <th className="px-4 py-2 text-right text-sm font-medium">
              Acciones
            </th>
          </tr>
          </thead>

          <tbody className="divide-y">
          {data.map((setting, index) => (
            <tr key={setting.id} className="hover:bg-gray-100">
              <td className="px-4 py-2 text-sm">{index + 1}</td>

              <td className="px-4 py-2 text-sm font-mono">
                {setting.key}
              </td>

              <td className="px-4 py-2 text-sm break-all">
                {renderValue(setting)}
              </td>

              <td className="px-4 py-2 text-right">
                <div className="inline-flex gap-2">
                  <button
                    className="p-2 rounded hover:bg-gray-200"
                    title="Editar"
                    onClick={() =>
                      router.push(`/admin/settings/${setting.id}/edit`)
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    className="p-2 rounded hover:bg-red-100 text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>

      {/* ===== Mobile cards ===== */}
      <div className="md:hidden flex flex-col gap-3">
        {data.map((setting) => (
          <div
            key={setting.id}
            className="bg-white shadow rounded-xl p-4 space-y-3"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold font-mono break-all">
                  {setting.key}
                </p>
                <div className="mt-1 text-sm">
                  {renderValue(setting)}
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  className="p-2 rounded hover:bg-gray-200"
                  title="Editar"
                  onClick={() =>
                    router.push(`/admin/settings/${setting.id}/edit`)
                  }
                >
                  <Edit className="h-4 w-4" />
                </button>

                <button
                  className="p-2 rounded hover:bg-red-100 text-red-600"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Helpers ===== */

function renderValue(setting: Setting) {
  if (setting.type === "BOOLEAN") {
    const isActive = setting.value === "true";

    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
          isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        )}
      >
        {isActive ? "Activo" : "Desactivado"}
      </span>
    );
  }

  return <span className="break-all">{setting.value}</span>;
}
