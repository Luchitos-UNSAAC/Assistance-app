
// components/TableOfAttendances.tsx
'use client';
import React, { useMemo } from 'react';

type Row = {
  index: number;
  id: string;
  name: string;
  email: string;
  phone: string;
  counts: Record<string, number>;
  total: number;
};

const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'JUSTIFIED', 'LATE'] as const;
const STATUS_LABELS: Record<string, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Ausente',
  JUSTIFIED: 'Justificado',
  LATE: 'Tarde',
};

export default function TableOfAttendances({ data }: { data: Row[] }) {
  // decide si mostramos la columna teléfono según datos
  const showPhone = useMemo(() => data.some((r) => Boolean(r.phone && r.phone.trim() !== '')), [data]);
  
  // totales calculados con useMemo para performance
  const totals = useMemo(() => {
    const t: Record<string, number> = { GENERAL: 0 };
    ATTENDANCE_STATUSES.forEach((s) => (t[s] = 0));
    data.forEach((r) => {
      ATTENDANCE_STATUSES.forEach((s) => {
        t[s] += Number(r.counts[s] ?? 0);
      });
      t.GENERAL += Number(r.total ?? 0);
    });
    return t;
  }, [data]);
  
  // column count for colSpan in empty state
  const columnCount = 3 + (showPhone ? 1 : 0) + ATTENDANCE_STATUSES.length + 1;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return (
    <div className="mt-6 w-full">
      {/* Desktop/table view */}
      <div className="hidden md:block bg-white shadow rounded-lg overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 justify-center items-center">
        <table className="min-w-full table-auto divide-y">
          <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">#</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Correo</th>
            {showPhone && <th className="px-4 py-3 text-left text-sm font-medium">Teléfono</th>}
            {ATTENDANCE_STATUSES.map((s) => (
              <th key={s} className="px-4 py-3 text-center text-sm font-medium">{STATUS_LABELS[s]}</th>
            ))}
            <th className="px-4 py-3 text-center text-sm font-medium">TOTAL</th>
          </tr>
          </thead>
          <tbody className="bg-white divide-y">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="px-4 py-6 text-center text-sm text-gray-500">No hay datos para el rango seleccionado.</td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm whitespace-nowrap">{row.index}</td>
                <td className="px-4 py-3 text-sm">{row.name}</td>
                <td className="px-4 py-3 text-sm">{row.email}</td>
                {showPhone && <td className="px-4 py-3 text-sm">{row.phone}</td>}
                {ATTENDANCE_STATUSES.map((s) => (
                  <td key={s} className="px-4 py-3 text-center text-sm">{row.counts[s] ?? 0}</td>
                ))}
                <td className="px-4 py-3 text-center text-sm font-medium">{row.total}</td>
              </tr>
            ))
          )}
          </tbody>
        </table>
        {/* Footer: totales agregados */}
        {data.length > 0 && (
          <div className="px-4 py-3 border-t bg-gray-50 text-sm flex justify-end gap-6">
            <div className="font-medium">Totales:</div>
            <div className="flex flex-wrap items-center gap-4">
              {ATTENDANCE_STATUSES.map((s) => (
                <div key={s} className="text-sm">
                  <span className="font-semibold">{STATUS_LABELS[s]}:</span>{' '}
                  <span>{totals[s]}</span>
                </div>
              ))}
              <div className="text-sm font-semibold ml-4">GENERAL: {totals.GENERAL}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile/card view */}
      {
        isMobile && (
          <div className="md:hidden flex flex-col gap-3">
            {data.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-4 text-center text-sm text-gray-500">No hay datos para el rango seleccionado.</div>
            ) : (
              data.map((row) => (
                <article key={row.id} className="bg-white shadow rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{row.name}</div>
                        <div className="text-xs text-gray-500">#{row.index}</div>
                      </div>
                      <div className="text-sm text-gray-600 break-words">{row.email}</div>
                      {showPhone && <div className="text-sm text-gray-600">{row.phone}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="text-lg font-semibold">{row.total}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {ATTENDANCE_STATUSES.map((s) => (
                      <div key={s} className="bg-gray-50 rounded-md p-2 text-center">
                        <div className="text-xs text-gray-500">{STATUS_LABELS[s]}</div>
                        <div className="text-sm font-medium">{row.counts[s] ?? 0}</div>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            )}
            
            {/* Totales globales para mobile */}
            {data.length > 0 && (
              <div className="bg-white shadow rounded-lg p-4">
                <div className="text-sm font-medium mb-2">Totales generales</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {ATTENDANCE_STATUSES.map((s) => (
                    <div key={s} className="flex justify-between">
                      <span className="text-gray-600">{STATUS_LABELS[s]}</span>
                      <span className="font-semibold">{totals[s]}</span>
                    </div>
                  ))}
                  <div className="flex justify-between col-span-2 border-t pt-2">
                    <span className="text-gray-800 font-medium">GENERAL</span>
                    <span className="font-semibold">{totals.GENERAL}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }
    </div>
  );
}
