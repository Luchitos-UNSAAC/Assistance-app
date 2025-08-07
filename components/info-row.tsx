"use client";

export function InfoRow({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <Icon className="h-3 w-3" />
      <span>{text}</span>
    </div>
  )
}
