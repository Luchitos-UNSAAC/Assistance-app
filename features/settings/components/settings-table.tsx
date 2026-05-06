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
      <div
        className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-4 bg-card/40 backdrop-blur-sm rounded-xl border border-dashed border-border/60">
        <p className="font-medium">No hay configuraciones registradas.</p>
        <Button
          variant="secondary"
          size="sm"
          className="font-bold tracking-tight"
          onClick={() => router.push("/admin/settings/new")}
        >
          <Plus className="h-4 w-4 mr-2"/>
          Agregar configuración
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header actions: Siguiendo el principio KISS */}
      <div className="flex justify-end items-center">
        <Button
          variant="outline" // Usando el color principal para la acción destacada
          onClick={() => router.push("/admin/settings/new")}
        >
          <Plus className="h-4 w-4 mr-2"/>
          Nueva Configuración
        </Button>
      </div>

      {/* ===== Desktop table: Refinada con variables del tema ===== */}
      <div
        className="hidden md:block overflow-hidden bg-card/50 backdrop-blur-md border border-border/50 rounded-xl shadow-sm">
        <table className="min-w-full table-auto">
          <thead className="bg-muted/50 border-b border-border/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">#</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Key
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Value
            </th>
            <th
              className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Acciones
            </th>
          </tr>
          </thead>

          <tbody className="divide-y divide-border/40">
          {data.map((setting, index) => (
            <tr key={setting.id} className="hover:bg-accent/40 transition-colors group">
              <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                {index + 1}
              </td>

              <td className="px-6 py-4 text-sm font-mono text-primary font-semibold">
                {setting.key}
              </td>

              <td className="px-6 py-4 text-sm">
                {renderValue(setting)}
              </td>

              <td className="px-6 py-4 text-right">
                <div className="inline-flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                    onClick={() => router.push(`/admin/settings/${setting.id}/edit`)}
                  >
                    <Edit className="h-4 w-4"/>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>

      {/* ===== Mobile cards: Diseño más "App-like" ===== */}
      <div className="md:hidden flex flex-col gap-4">
        {data.map((setting) => (
          <div
            key={setting.id}
            className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-5 space-y-4 shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">Key</span>
                  <p className="text-sm font-bold font-mono break-all text-foreground/90 leading-tight">
                    {setting.key}
                  </p>
                </div>
                <div className="mt-3">
                  {renderValue(setting)}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 rounded-xl shadow-sm"
                  onClick={() => router.push(`/admin/settings/${setting.id}/edit`)}
                >
                  <Edit className="h-4 w-4"/>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4"/>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Helpers Refactorizados ===== */

function renderValue(setting: Setting) {
  if (setting.type === "BOOLEAN") {
    const isActive = setting.value === "true";

    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border",
          isActive
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            : "bg-destructive/10 text-destructive border-destructive/20"
        )}
      >
        <span
          className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-destructive")}/>
        {isActive ? "Activo" : "Desactivado"}
      </span>
    );
  }

  return (
    <span
      className="text-sm font-medium text-foreground/70 break-all bg-muted/30 px-2 py-1 rounded border border-border/20">
      {setting.value}
    </span>
  );
}
