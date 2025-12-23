export const dynamic = "force-dynamic"

export default function DiagnosticsPage() {
  const date = new Date()

  return (
    <div className='flex flex-col w-full gap-2'>
      <h2>Application Diagnostics</h2>

      <h3>
        <strong>Time</strong>
      </h3>
      <ul>
        <li>Local: {date.toLocaleString("es-PE", { timeZone: "America/Lima" })}</li>
        <li>UTC: {date.toUTCString()}</li>
        <li>ISO: {date.toISOString()}</li>
      </ul>

      <h3>
        <strong>Runtime</strong>
      </h3>
      <ul>
        <li>Node: {process.version}</li>
        <li>Platform: {process.platform}</li>
        <li>Arch: {process.arch}</li>
        <li>Env: {process.env.NODE_ENV}</li>
      </ul>

      <h3>
        <strong>Server</strong>
      </h3>
      <ul>
        <li>PID: {process.pid}</li>
        <li>Uptime (s): {Math.floor(process.uptime())}</li>
      </ul>

      <h3>
        <strong>Environment</strong>
      </h3>
      <ul>
        <li>Database configured: {String(Boolean(process.env.DATABASE_URL))}</li>
        <li>Auth configured: {String(Boolean(process.env.JWT_SECRET))}</li>
      </ul>

      <h3>
        <strong>Memory</strong>
      </h3>
      <ul>
        <li>RSS: {Math.round(process.memoryUsage().rss / 1024 / 1024)} MB</li>
        <li>Heap Used: {Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</li>
      </ul>
    </div>
  )
}
