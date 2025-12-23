'use client'

import { useEffect, useState } from "react"

export default function DateClient() {
  const [now, setNow] = useState(new Date())

  const locale = "es-PE" // País / idioma
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const fullFormat = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
  }).format(now)

  return (
    <div>
      <h1>Client</h1>
      <h2>Date & Time Information</h2>

      <ul>
        <li><strong>Country / Locale:</strong> {locale}</li>
        <li><strong>Time Zone:</strong> {timeZone}</li>
        <li><strong>Full Format:</strong> {fullFormat}</li>
        <li><strong>Date:</strong> {now.toLocaleDateString(locale)}</li>
        <li><strong>Time:</strong> {now.toLocaleTimeString(locale)}</li>
        <li><strong>ISO Format:</strong> {now.toISOString()}</li>
        <li><strong>Timestamp (ms):</strong> {now.getTime()}</li>
        <li><strong>UTC Time:</strong> {now.toUTCString()}</li>
      </ul>
    </div>
  )
}
