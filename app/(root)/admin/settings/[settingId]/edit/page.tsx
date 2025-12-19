import { notFound } from "next/navigation";
import SettingForm from "@/features/settings/components/setting-form";
import {getSettingById} from "@/features/settings/actions/get-setting-by-id";

interface PageProps {
  params: Promise<{ settingId: string }>;
}

export default async function Page({ params }: PageProps) {
  const {settingId} = await params
  const setting = await getSettingById(settingId);

  if (!setting) return notFound();

  return (
    <div className="w-full max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-2">
        Editar configuración
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Modifica el valor de la configuración.
      </p>

      <SettingForm setting={setting} />
    </div>
  );
}
