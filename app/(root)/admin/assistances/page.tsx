// app/(admin)/attendances/page.tsx
import { prisma } from '@/lib/prisma';
import { DateTime } from 'luxon';
import { FilterToGenerateReports } from '@/features/admin/components/filter-to-generate-reports';
import TableOfAttendances from "@/features/admin/components/table-of-attendances";

// Página servidor: obtiene un resumen inicial y lo pasa al componente cliente
export default async function Page() {
  // DEFAULT: últimos 30 días en zona America/Lima
  const tz = 'America/Lima';
  const end = DateTime.now().setZone(tz).endOf('day').toUTC().toJSDate();
  const start = DateTime.now().setZone(tz).minus({ days: 29 }).startOf('day').toUTC().toJSDate();
  
  // Construir filtro para Prisma
  const attendanceWhere: any = {
    deletedAt: null,
    volunteer: { deletedAt: null, status: { in: ['ACTIVE', 'INACTIVE'] } },
    date: { gte: start, lte: end },
  };
  
  // Agrupar asistencias por volunteerId + status
  const grouped = await prisma.attendance.groupBy({
    by: ['volunteerId', 'status'],
    where: attendanceWhere,
    _count: { _all: true },
  });
  
  // Mapear counts por volunteer
  const countsByVolunteer: Record<string, Record<string, number>> = {};
  grouped.forEach((g) => {
    const vid = g.volunteerId;
    const s = g.status as string;
    const cnt = (g._count && (g._count._all ?? 0)) ?? 0;
    if (!countsByVolunteer[vid]) countsByVolunteer[vid] = {};
    countsByVolunteer[vid][s] = cnt;
  });
  
  // Obtener voluntarios (solo los que tienen registro en el rango)
  const volunteerIds = Array.from(new Set(grouped.map((g) => g.volunteerId)));
  const volunteers = volunteerIds.length > 0
    ? await prisma.volunteer.findMany({
      where: { id: { in: volunteerIds }, deletedAt: null },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { name: 'asc' },
    })
    : [];
  
  // Construir rows en el formato que espera el componente cliente
  const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'JUSTIFIED', 'LATE'];
  const rows = volunteers.map((v, i) => {
    const raw = countsByVolunteer[v.id] ?? {};
    const counts = ATTENDANCE_STATUSES.reduce((acc, s) => {
      acc[s] = raw[s] ? Number(raw[s]) : 0;
      return acc;
    }, {} as Record<string, number>);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return {
      index: i + 1,
      id: v.id,
      name: v.name,
      email: v.email,
      phone: v.phone ?? '',
      counts,
      total,
    };
  });
  
  return (
    <div className="flex">
      <TableOfAttendances data={rows} />
    </div>
  );
}