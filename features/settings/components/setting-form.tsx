'use client';

import React, {useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {updateSetting} from "@/features/settings/actions/update-setting-by-id";
import {createNewSetting} from "@/features/settings/actions/create-new-setting";
import {SettingType} from "@prisma/client"
import {Switch} from "@/components/ui/switch";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

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
  {
    value: SettingType.BOOLEAN,
    name: 'BOOLEAN'
  },
  {
    value: SettingType.NUMBER,
    name: 'NUMBER'
  },
  {
    value: SettingType.TEXT,
    name: 'TEXT'
  },
  {
    value: SettingType.JSON,
    name: 'JSON'
  }
]

export default function SettingForm({setting}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [keyName, setKeyName] = useState(setting?.key ?? '');
  const [value, setValue] = useState(setting?.value ?? '');
  const [type, setType] = useState(setting?.type ?? '');
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
        : await createNewSetting({key: keyName.trim(), value: value.trim()});

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
          onChange={e => setKeyName(e.target.value)}
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
      <Select
        disabled={isEdit}
        value={type}
        onValueChange={(value) => setType(value)}
      >
        <SelectTrigger>
          <SelectValue
            placeholder="Selecciona un tipo"
            defaultValue={SettingType.BOOLEAN}/>
        </SelectTrigger>
        <SelectContent>
          {settingTypes.map((volunteer) => (
            <SelectItem key={volunteer.name} value={volunteer.value}>
              {volunteer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* VALUE */}
      {
        type !== SettingType.BOOLEAN
          ? <div>
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
          : <div>
            <label className="block text-sm font-medium mb-1">
              Value
            </label>
            <Switch
              className="
              data-[state=checked]:bg-black
              data-[state=unchecked]:bg-gray-100
              transition-colors
              focus-visible:ring-2
              focus-visible:ring-red-700
              border-gray-950
            "
              checked={value === 'true'}
              onCheckedChange={(checked) =>
                setValue(checked ? 'true' : 'false')
              }
            />
          </div>
      }

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
