import SettingForm from "@/features/settings/components/setting-form";

export default function Page() {
  return (
    <div className="w-full max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-2">
        Nueva configuración
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Define una clave y su valor para la configuración del sistema.
      </p>

      <SettingForm />
    </div>
  );
}
