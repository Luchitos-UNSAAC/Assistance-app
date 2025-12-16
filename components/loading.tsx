"use client"

export const LoadingDog = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-50 animate-pulse opacity-60">
      <div className="flex items-center justify-center w-40 h-40 mb-6 rounded-full bg-blue-200 shadow-lg animate-bounce overflow-hidden">
        <img
          src="/favicon.ico"
          alt="Perrito esperando"
          className="w-40 h-40 object-contain"
        />
      </div>

      <p className="text-xl font-semibold text-gray-700 text-center">
        ¡El perrito está esperando… 🐶!
      </p>
    </div>
  )
}
