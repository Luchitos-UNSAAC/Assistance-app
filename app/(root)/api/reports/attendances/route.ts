// app/api/attendances/export-summary/professional/route.ts
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';
import { DateTime } from 'luxon';

export const runtime = 'nodejs';

type ReqBody = {
  startDate: string; // ISO date or yyyy-MM-dd
  endDate: string;   // ISO date or yyyy-MM-dd
  statuses?: Array<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>;
  timezone?: string; // e.g. "America/Lima"
  includePhone?: boolean;
  onlyWithAttendance?: boolean;
};

const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'JUSTIFIED', 'LATE'] as const;
const EXPORT_IN_MEMORY_LIMIT = 30000; // umbral de filas para exportar en memoria
const MAX_RANGE_DAYS = 365;

function parseRangeInZone(startIso: string, endIso: string, tz: string) {
  // Parse start as startOf('day') and end as endOf('day') in given timezone.
  const start = DateTime.fromISO(startIso, { zone: tz });
  const end = DateTime.fromISO(endIso, { zone: tz });
  
  if (!start.isValid) throw new Error(`startDate inválida: ${startIso}`);
  if (!end.isValid) throw new Error(`endDate inválida: ${endIso}`);
  
  const startOfDay = start.startOf('day');
  const endOfDay = end.endOf('day');
  
  // convert to UTC JS Date for DB filtering
  const startZ = startOfDay.toUTC().toJSDate();
  const endZ = endOfDay.toUTC().toJSDate();
  
  // diff days inclusive
  const diffDays = Math.floor(endOfDay.startOf('day').diff(startOfDay.startOf('day'), 'days').days) + 1;
  
  return { startZ, endZ, diffDays };
}

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json().catch(() => ({}));
    const tz = body.timezone ?? 'America/Lima';
    const generatedBy = (req.headers.get('x-user-name') ?? 'system').toString();
    
    // Validación de campos requeridos
    if (!body.startDate || !body.endDate) {
      return new Response(JSON.stringify({ error: 'startDate y endDate son requeridos (formato ISO o YYYY-MM-DD).' }), { status: 400 });
    }
    
    // Parsear y validar rango
    let startUTC: Date;
    let endUTC: Date;
    let diffDays: number;
    try {
      const parsed = parseRangeInZone(body.startDate, body.endDate, tz);
      startUTC = parsed.startZ;
      endUTC = parsed.endZ;
      diffDays = parsed.diffDays;
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 400 });
    }
    
    if (diffDays <= 0) {
      return new Response(JSON.stringify({ error: 'endDate debe ser igual o posterior a startDate.' }), { status: 400 });
    }
    if (diffDays > MAX_RANGE_DAYS) {
      return new Response(JSON.stringify({
        error: `Rango demasiado grande. El rango máximo permitido es de ${MAX_RANGE_DAYS} días.`,
        sugerencia: 'Reduce el rango de fechas o implementa un export por streaming.'
      }), { status: 413 });
    }
    
    const statuses = body.statuses && body.statuses.length > 0 ? body.statuses : ['ACTIVE', 'INACTIVE'];
    
    // Construir filtro para groupBy en attendances
    const attendanceWhere: any = {
      deletedAt: null,
      volunteer: { deletedAt: null, status: { in: statuses } },
      date: { gte: startUTC, lte: endUTC },
    };
    
    // 1) Agrupar asistencias por volunteerId + status
    const grouped = await prisma.attendance.groupBy({
      by: ['volunteerId', 'status'],
      where: attendanceWhere,
      _count: { _all: true },
    });
    
    // IDs de voluntarios con asistencias en el rango
    const volunteerIdsWithAttendance = Array.from(new Set(grouped.map(g => g.volunteerId)));
    
    // 2) Obtener voluntarios (según onlyWithAttendance)
    const volunteerFilter: any = { deletedAt: null, status: { in: statuses } };
    if (body.onlyWithAttendance) {
      if (volunteerIdsWithAttendance.length === 0) {
        // devolver un reporte vacío pero bien formado
        return await buildExcelAndReturn({
          timezone: tz,
          generatedBy,
          filters: { startDate: body.startDate, endDate: body.endDate, statuses },
          volunteers: [],
          grouped,
          includePhone: !!body.includePhone
        });
      }
      volunteerFilter.id = { in: volunteerIdsWithAttendance };
    }
    
    const volunteers = await prisma.volunteer.findMany({
      where: volunteerFilter,
      select: { id: true, name: true, email: true, phone: true, status: true },
      orderBy: { name: 'asc' },
    });
    
    // Comprobación de seguridad de memoria
    if (volunteers.length > EXPORT_IN_MEMORY_LIMIT) {
      return new Response(JSON.stringify({
        error: 'Conjunto de datos demasiado grande para exportar en memoria. Por favor, reduzca los filtros o use exportación por streaming.',
        sugerencia: 'Use onlyWithAttendance=true o reduzca el rango de fechas.'
      }), { status: 413 });
    }
    
    return await buildExcelAndReturn({
      timezone: tz,
      generatedBy,
      filters: { startDate: body.startDate, endDate: body.endDate, statuses },
      volunteers,
      grouped,
      includePhone: !!body.includePhone
    });
    
  } catch (err: any) {
    console.error('Error export profesional (rango):', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
}

/** Función helper para construir el workbook y devolver Response (Excel) */
async function buildExcelAndReturn({
                                     timezone,
                                     generatedBy,
                                     filters,
                                     volunteers,
                                     grouped,
                                     includePhone,
                                   }: {
  timezone: string;
  generatedBy: string;
  filters: any;
  volunteers: Array<any>;
  grouped: Array<any>;
  includePhone: boolean;
}) {
  // Mapear counts por voluntario
  const countsByVolunteer: Record<string, Record<string, number>> = {};
  grouped.forEach(g => {
    const vid = g.volunteerId;
    const s = g.status as string;
    const cnt = (g._count && (g._count._all ?? 0)) ?? 0;
    if (!countsByVolunteer[vid]) countsByVolunteer[vid] = {};
    countsByVolunteer[vid][s] = cnt;
  });
  
  // Construir filas
  const rows = volunteers.map((v, idx) => {
    const raw = countsByVolunteer[v.id] ?? {};
    const counts: Record<string, number> = {};
    let total = 0;
    ATTENDANCE_STATUSES.forEach(status => {
      const c = raw[status] ? Number(raw[status]) : 0;
      counts[status] = c;
      total += c;
    });
    return {
      index: idx + 1,
      id: v.id,
      name: v.name,
      email: v.email,
      phone: v.phone ?? '',
      counts,
      total,
      status: v.status,
    };
  });
  
  // Crear workbook
  const workbook = new ExcelJS.Workbook();
  
  // Hoja Metadata
  const meta = workbook.addWorksheet('Metadatos', { views: [{ state: 'frozen', ySplit: 1 }] });
  meta.properties.defaultRowHeight = 18;
  const reportTitle = 'Reporte Resumen de Asistencias';
  meta.mergeCells('A1', 'D1');
  const titleCell = meta.getCell('A1');
  titleCell.value = reportTitle;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  
  const generatedAtStr = DateTime.now().setZone(timezone).toFormat('yyyy-LL-dd HH:mm ZZZZ');
  const metaRows = [
    ['Generado por', generatedBy],
    ['Generado el', generatedAtStr],
    ['Zona horaria', timezone],
    ['Filtros', JSON.stringify(filters)],
    ['Voluntarios en el reporte', String(volunteers.length)],
    ['Grupos de estado de asistencia agregados', String(grouped.length)],
  ];
  meta.addRows(metaRows);
  meta.addRow([]);
  meta.addRow(['Notas', 'Este reporte excluye voluntarios y asistencias marcados como eliminados (deletedAt != null).']);
  
  // Hoja de datos
  const sheet = workbook.addWorksheet('Resumen', { views: [{ state: 'frozen', ySplit: 1 }] });
  const header = ['#', 'Nombre', 'Correo'];
  if (includePhone) header.push('Teléfono');
  ATTENDANCE_STATUSES.forEach(s => header.push(s));
  header.push('TOTAL');
  sheet.addRow(header);
  
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 11 };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;
  
  rows.forEach(r => {
    const base = [r.index, r.name, r.email];
    if (includePhone) base.push(r.phone);
    const counts = ATTENDANCE_STATUSES.map(s => r.counts[s]);
    const rowData = [...base, ...counts, r.total];
    sheet.addRow(rowData);
  });
  
  // Pie de totales (fórmulas)
  const dataStart = 2;
  const dataEnd = sheet.rowCount;
  if (dataEnd >= dataStart) {
    const footer: any[] = [];
    footer[1] = 'TOTALES';
    footer[2] = '';
    footer[3] = '';
    let colIdx = 4;
    if (includePhone) colIdx = 5;
    ATTENDANCE_STATUSES.forEach((s, idx) => {
      const col = colIdx + idx;
      const letter = sheet.getColumn(col).letter;
      footer[col] = { formula: `SUM(${letter}${dataStart}:${letter}${dataEnd})` };
    });
    const totalCol = colIdx + ATTENDANCE_STATUSES.length;
    const totalLetter = sheet.getColumn(totalCol).letter;
    footer[totalCol] = { formula: `SUM(${totalLetter}${dataStart}:${totalLetter}${dataEnd})` };
    const f = sheet.addRow(footer);
    f.font = { bold: true };
  }
  
  // Estilos: anchos, alineación, bordes, filas alternadas
  sheet.columns.forEach((col, i) => {
    const headerText = String(header[i] ?? '');
    col.width = Math.max(12, Math.min(40, headerText.length + 10));
    col.alignment = { vertical: 'middle', horizontal: i < (includePhone ? 4 : 3) ? 'left' : 'center' };
    // @ts-ignore
    col.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
  });
  
  // Relleno alternado para filas de datos
  for (let r = dataStart; r <= dataEnd; r++) {
    if ((r - dataStart) % 2 === 0) {
      const row = sheet.getRow(r);
      row.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9F9F9' },
        };
      });
    }
  }
  
  // AutoFilter y freeze header
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  
  // Nombre del archivo
  const startLabel = String(filters.startDate).replace(/[: ]/g, '_');
  const endLabel = String(filters.endDate).replace(/[: ]/g, '_');
  const filename = `resumen_asistencias_${startLabel}_a_${endLabel}_${DateTime.now().toFormat('yyyyLLdd_HHmm')}.xlsx`;
  
  // Buffer (apto para tamaños moderados)
  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
