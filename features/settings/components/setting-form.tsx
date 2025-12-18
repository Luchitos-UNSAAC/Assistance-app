'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {updateSetting} from "@/features/settings/actions/update-setting-by-id";
import {createNewSetting} from "@/features/settings/actions/create-new-setting";

type Setting = {
  id: string;
  key: string;
  value: string;
};

interface Props {
  setting?: Setting;
}

export default function SettingForm({ setting }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [keyName, setKeyName] = useState(setting?.key ?? '');
  const [value, setValue] = useState(setting?.value ?? '');
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!setting;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!keyName.trim() || !value.trim()) {
      setError("El valor no puede estar vacío.");
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
      className="space-y-6 bg-white rounded-xl border p-6 shadow-sm"
    >
      {/* KEY */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Key
        </label>
        <input
          value={keyName}
          disabled={isEdit}
          className={`w-full px-3 py-2 border rounded-md text-sm font-mono
            ${isEdit ? 'bg-gray-100 text-gray-500' : ''}
          `}
        />
        {isEdit && (
          <p className="text-xs text-gray-500 mt-1">
            La key no se puede modificar.
          </p>
        )}
      </div>

      {/* VALUE */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Value
        </label>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-md text-sm
                     focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
