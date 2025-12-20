import {getSettings} from "@/features/settings/actions/get-settings";
import SettingsTable from "@/features/settings/components/settings-table";
import React from "react";

export default async function Page() {
  const settings = await getSettings()
  return (
    <div className="w-full">
      <div className="mb-3 mt-6">
        <h1 className='text-2xl font-bold'>Configuraciones</h1>
        <p className="text-gray-800">
          Gestion de configuraciones
        </p>
      </div>

      <SettingsTable data={settings} />
    </div>
  )
}
