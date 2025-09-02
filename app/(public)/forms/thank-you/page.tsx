export default function ThankYouPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-4xl font-bold mb-4 text-purple-700">¡Gracias por completar el formulario!</h1>
      <p className="text-lg text-gray-700 mb-8">Hemos recibido tus respuestas con éxito.</p>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">¿Qué sucede ahora?</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Revisaremos tus respuestas cuidadosamente.</li>
          <li>Te notificaremos sobre los próximos pasos en el proceso.</li>
        </ul>
      </div>
    </div>
  );
}