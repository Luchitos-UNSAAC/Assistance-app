'use client';

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Usamos el componente de Shadcn
import { Label } from "@/components/ui/label";
import { updateSetting } from "@/features/settings/actions/update-setting-by-id";
import { createNewSetting } from "@/features/settings/actions/create-new-setting";
import { SettingType } from "@prisma/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";

type Setting = {
  id: string;
  key: string;
  value: string;
  type: SettingType
};

interface Props {
  setting?: Setting;
}

const settingTypes = [
  { value: SettingType.BOOLEAN, name: 'Lógico (Boolean)' },
  { value: SettingType.NUMBER, name: 'Numérico (Number)' },
  { value: SettingType.TEXT, name: 'Texto (Text)' },
  { value: SettingType.JSON, name: 'Objeto (JSON)' }
]

export default function SettingForm({ setting }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [keyName, setKeyName] = useState(setting?.key ?? '');
  const [value, setValue] = useState(setting?.value ?? '');
  const [type, setType] = useState(setting?.type ?? SettingType.TEXT);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!setting;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!keyName.trim() || !value.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    startTransition(async () => {
      const res = isEdit
        ? await updateSetting(setting!.id, value.trim())
        : await createNewSetting({ key: keyName.trim(), value: value.trim() });

      if (res?.error) {
        setError(res.error ?? "Error inesperado");
        return;
      }

      router.push("/admin/settings");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-8 bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-8 shadow-xl"
    >
      <div className="space-y-6">
        {/* KEY SECTION */}
        <div className="grid gap-2">
          <Label htmlFor="key" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Identificador (Key)
          </Label>
          <Input
            id="key"
            value={keyName}
            disabled={isEdit}
            onChange={e => setKeyName(e.target.value)}
            placeholder="EJEMPLO_CONFIG_KEY"
            className={cn(
              "font-mono text-sm border-border/40 focus-visible:ring-primary/20",
              isEdit && "bg-muted/50 text-muted-foreground cursor-not-allowed border-none"
            )}
          />
          {isEdit ? (
            <p className="flex items-center gap-1.5 text-[11px] text-amber-500 font-medium">
              <AlertCircle className="h-3 w-3" /> La llave es única y no se puede modificar.
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground italic">Usa mayúsculas y guiones bajos para consistencia.</p>
          )}
        </div>

        {/* TYPE SELECTION */}
        <div className="grid gap-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Tipo de Dato
          </Label>
          <Select
            disabled={isEdit}
            value={type}
            onValueChange={(value) => setType(value as SettingType)}
          >
            <SelectTrigger className="bg-background/50 border-border/40">
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent className="bg-popover/95 backdrop-blur-md border-border/50">
              {settingTypes.map((t) => (
                <SelectItem key={t.value} value={t.value} className="focus:bg-primary/10">
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* VALUE SECTION - BOOLEAN */}
        {type === SettingType.BOOLEAN && (
          <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/80">
              Valor de Configuración
            </Label>

            <div className="flex p-1 bg-background/50 rounded-lg border border-border/40 w-fit">
              <button
                type="button"
                onClick={() => setValue("true")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all",
                  value === "true"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                {value === "true" && <CheckCircle2 className="h-4 w-4" />}
                Activo
              </button>

              <button
                type="button"
                onClick={() => setValue("false")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all",
                  value === "false"
                    ? "bg-destructive text-destructive-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                {value === "false" && <AlertCircle className="h-4 w-4" />}
                Desactivado
              </button>
            </div>
          </div>
        )}

        {/* VALUE SECTION - OTHERS (TEXT/JSON/NUMBER) */}
        {type !== SettingType.BOOLEAN && (
          <div className="grid gap-2">
            <Label htmlFor="value" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Valor
            </Label>
            <Input
              id="value"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={type === SettingType.JSON ? '{ "key": "value" }' : "Ingresa el valor..."}
              className="bg-background/50 border-border/40 focus-visible:ring-primary/20"
            />
          </div>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium animate-in fade-in zoom-in-95">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
        <Button
          type="button"
          variant="ghost"
          className="font-semibold text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={isPending}
          className="min-w-[140px] font-bold shadow-lg shadow-primary/20"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Guardando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isEdit ? "Actualizar" : "Crear Ajuste"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
