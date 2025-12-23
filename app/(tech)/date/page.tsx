import DateClient from "@/components/tech/date-tech";

export default function DatePage() {
  const date = new Date()

  const locale = "es-PE"
  const timeZone = "America/Lima"

  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
  })

  return (
    <div className={'flex gap-2'}>
      <div>
        <h2>Server</h2>

        <ul>
          <li><strong>Locale:</strong> {locale}</li>
          <li><strong>Country:</strong> Perú</li>
          <li><strong>Time Zone:</strong> {timeZone}</li>

          <li><strong>Full format:</strong> {formatter.format(date)}</li>
          <li><strong>Date:</strong> {date.toLocaleDateString(locale, { timeZone })}</li>
          <li><strong>Time:</strong> {date.toLocaleTimeString(locale, { timeZone })}</li>

          <li><strong>ISO:</strong> {date.toISOString()}</li>
          <li><strong>UTC:</strong> {date.toUTCString()}</li>
          <li><strong>Timestamp (ms):</strong> {date.getTime()}</li>
        </ul>
      </div>

      <DateClient />
    </div>
  )
}
