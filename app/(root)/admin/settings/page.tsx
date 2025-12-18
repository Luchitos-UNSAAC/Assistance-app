import {getSettings} from "@/features/settings/actions/get-settings";
import SettingsTable from "@/features/settings/components/settings-table";

export default async function Page() {
  const settings = await getSettings()
  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Configuraciones del sistema
      </h1>

      <SettingsTable data={settings} />
    </div>
  )
}
