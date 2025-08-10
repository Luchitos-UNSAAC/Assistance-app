// app/api/attendances/export-summary/route.ts
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export const runtime = 'nodejs';

type ReqBody = {
  year?: number;
  month?: number;
  day?: number;
  statuses?: Array<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>;
  timezone?: string;
};

const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'JUSTIFIED', 'LATE'] as const;
type AttendanceStatusType = typeof ATTENDANCE_STATUSES[number];

function buildDateRange(body: ReqBody) {
  const { year, month, day } = body;
  if (!year) return null;
  
  if (year && month && day) {
    const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const end = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));
    return { gte: start, lt: end };
  }
  
  if (year && month) {
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    return { gte: start, lt: end };
  }
  
  if (year) {
    const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));
    return { gte: start, lt: end };
  }
  
  return null;
}

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json().catch(() => ({}));
    
    // validations
    if (body.month && (body.month < 1 || body.month > 12)) {
      return new Response(JSON.stringify({ error: 'month must be 1-12' }), { status: 400 });
    }
    if (body.day && (body.day < 1 || body.day > 31)) {
      return new Response(JSON.stringify({ error: 'day must be 1-31' }), { status: 400 });
    }
    
    const statuses = body.statuses && body.statuses.length > 0
      ? body.statuses
      : ['ACTIVE', 'INACTIVE'] as Array<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>;
    
    const dateFilter = buildDateRange(body);
    
    // Build attendance where clause (we can filter by related volunteer fields)
    const attendanceWhere: any = {
      deletedAt: null,
      volunteer: { deletedAt: null, status: { in: statuses } },
    };
    if (dateFilter) attendanceWhere.date = dateFilter;
    
    // 1) Group attendances by volunteerId + status (single query, efficient)
    const grouped = await prisma.attendance.groupBy({
      by: ['volunteerId', 'status'],
      where: attendanceWhere,
      _count: { _all: true },
    });
    
    // 2) Get distinct volunteerIds from grouped results
    const volunteerIds = Array.from(new Set(grouped.map((g) => g.volunteerId)));
    
    // 3) Fetch volunteers that match filters (include volunteers with zero attendances)
    //    We include only volunteers that match statuses and not soft-deleted.
    const volunteers = await prisma.volunteer.findMany({
      where: {
        deletedAt: null,
        status: { in: statuses },
        // optionally: if you want only those within the date range that had attendances,
        // use: id: { in: volunteerIds }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
      },
      orderBy: { name: 'asc' },
    });
    
    // If you want to include only volunteers who have at least one attendance in the range,
    // uncomment the filter on the findMany above: id: { in: volunteerIds }
    
    // 4) Map grouped counts: { [volunteerId]: { PRESENT: n, ... } }
    const countsByVolunteer: Record<string, Record<string, number>> = {};
    grouped.forEach((g) => {
      const vid = g.volunteerId;
      const s = g.status as string;
      const cnt = (g._count && (g._count._all ?? 0)) ?? 0;
      if (!countsByVolunteer[vid]) {
        countsByVolunteer[vid] = {};
      }
      countsByVolunteer[vid][s] = cnt;
    });
    
    // 5) Prepare rows for Excel
    type Row = {
      index: number;
      name: string;
      email: string;
      counts: Record<AttendanceStatusType, number>;
      total: number;
    };
    
    const rows: Row[] = [];
    
    // We'll iterate volunteers. If want only volunteers with attendance, filter volunteers by volunteerIds set.
    // const volunteersToReport = volunteers.filter(v => volunteerIds.includes(v.id));
    const volunteersToReport = volunteers; // includes zero-count volunteers
    
    for (const [i, v] of volunteersToReport.entries()) {
      const countsRaw = countsByVolunteer[v.id] ?? {};
      const counts = {} as Record<AttendanceStatusType, number>;
      let total = 0;
      ATTENDANCE_STATUSES.forEach((status) => {
        const c = countsRaw[status] ? Number(countsRaw[status]) : 0;
        counts[status] = c;
        total += c;
      });
      
      rows.push({
        index: i + 1,
        name: v.name,
        email: v.email,
        counts,
        total,
      });
    }
    
    // 6) Create Excel workbook and sheet
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Summary');
    
    // Header row: #, name, email, [statuses...], TOTAL
    const header = ['#', 'name', 'email', ...ATTENDANCE_STATUSES, 'TOTAL'];
    sheet.addRow(header);
    
    // Style header (bold)
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 18;
    
    // Add data rows
    rows.forEach((r) => {
      const rowValues = [
        r.index,
        r.name,
        r.email,
        ...ATTENDANCE_STATUSES.map((s) => r.counts[s]),
        r.total,
      ];
      sheet.addRow(rowValues);
    });
    
    // Add totals footer (sum column-wise) - optional
    const footerRowIndex = sheet.rowCount + 1;
    const footer = [];
    footer[1] = 'TOTALS'; // leave first col empty (#)
    footer[2] = ''; // name
    footer[3] = ''; // email
    // For each status column, build formula SUM(colRange)
    // header is row 1, data starts at row 2 and ends at rowCount
    const dataStart = 2;
    const dataEnd = sheet.rowCount;
    // find column indexes (1-based)
    const colIndexForStatusStart = 4; // because: 1(#),2(name),3(email), 4 -> PRESENT
    ATTENDANCE_STATUSES.forEach((s, idx) => {
      const col = colIndexForStatusStart + idx;
      // Excel formula e.g. =SUM(D2:D{dataEnd})
      footer[col] = { formula: `SUM(${sheet.getColumn(col).letter}${dataStart}:${sheet.getColumn(col).letter}${dataEnd})` };
    });
    // TOTAL column index
    const totalColIndex = colIndexForStatusStart + ATTENDANCE_STATUSES.length;
    footer[totalColIndex] = { formula: `SUM(${sheet.getColumn(totalColIndex).letter}${dataStart}:${sheet.getColumn(totalColIndex).letter}${dataEnd})` };
    
    // push footer only if there is at least one data row
    if (dataEnd >= dataStart) {
      const f = sheet.addRow(footer);
      f.font = { bold: true };
    }
    
    // Auto width (simple)
    sheet.columns?.forEach((col) => {
      let maxLength = 10;
      
      //@ts-ignore
      col.eachCell({ includeEmpty: true }, (cell) => {
        const v = cell.value;
        const text = v && typeof v === 'object' && 'richText' in v
          ? (v as any).richText.map((x: any) => x.text).join('')
          : String(v ?? '');
        if (text.length > maxLength) maxLength = text.length;
      });
      col.width = Math.min(Math.max(maxLength + 2, 8), 60);
    });
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // filename
    const parts = [];
    if (body.year) parts.push(String(body.year));
    if (body.month) parts.push(String(body.month).padStart(2, '0'));
    if (body.day) parts.push(String(body.day).padStart(2, '0'));
    const filterLabel = parts.length ? parts.join('-') : 'all';
    const filename = `attendances_summary_${filterLabel}_${statuses.join('_')}.xlsx`;
    
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('Export summary error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
