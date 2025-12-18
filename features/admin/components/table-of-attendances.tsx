'use client';

import React, {useMemo} from 'react';
import {format} from "date-fns";
import {VolunteerWithAttendancesByStatus} from "@/features/admin/actions/get-volunteers-with-attendances-for-admin";
import {ArrowDown, ArrowUp, ArrowUpDown, Edit} from "lucide-react";
import AuthGuard from "@/components/auth-guard";
import {MultiSelect} from "@/components/ui/multi-select";
import {ButtonActions} from "@/features/admin/components/button-actions";

const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'JUSTIFIED', 'LATE'] as const;
const STATUS_LABELS: Record<string, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Ausente',
  JUSTIFIED: 'Justificado',
  LATE: 'Tarde',
};

type SortKey =
  | 'name'
  | 'present'
  | 'absent'
  | 'birthday';

type SortDirection = 'asc' | 'desc';

const WEEK_DAYS = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO_MANIANA',
  'SABADO_TARDE',
  'DOMINGO',
] as const;

const WEEK_DAY_LABELS: Record<string, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO_MANIANA: 'Sábado Maniana',
  SABADO_TARDE: 'Sábado Tarde',
  DOMINGO: 'Domingo',
};

export default function TableOfAttendances({data}: { data: VolunteerWithAttendancesByStatus[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey>('name');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');
  const [search, setSearch] = React.useState('');
  const [selectedDays, setSelectedDays] = React.useState<string[]>([]);

  const scheduleOptions = WEEK_DAYS.map(day => ({
    value: day,
    label: WEEK_DAY_LABELS[day],
    style: {
      badgeColor: "#000",
      iconColor: "#000",
    },
  }));

  const showPhone = useMemo(() => data.some((r) => Boolean(r.phone && r.phone.trim() !== '')), [data]);
  const columnCount = 3 + (showPhone ? 1 : 0) + ATTENDANCE_STATUSES.length + 1;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;

    const term = search.toLowerCase();

    return data.filter(row =>
      row.name.toLowerCase().includes(term)
    );
  }, [data, search]);

  const filteredBySchedule = useMemo(() => {
    if (selectedDays.length === 0) return filteredData;

    return filteredData.filter(row =>
      row.groupMembers?.some(member =>
        member.group?.dayOfWeek &&
        selectedDays.includes(member.group.dayOfWeek)
      )
    );
  }, [filteredData, selectedDays]);

  const sortedData = useMemo(() => {
    const copy = [...filteredBySchedule];

    copy.sort((a, b) => {
      let valueA: string | number = '';
      let valueB: string | number = '';

      switch (sortKey) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;

        case 'present':
          valueA = a.attendances.PRESENT ?? 0;
          valueB = b.attendances.PRESENT ?? 0;
          break;

        case 'absent':
          valueA = a.attendances.ABSENT ?? 0;
          valueB = b.attendances.ABSENT ?? 0;
          break;

        case 'birthday':
          valueA = a.birthday ? new Date(a.birthday).getTime() : 0;
          valueB = b.birthday ? new Date(b.birthday).getTime() : 0;
          break;
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return copy;
  }, [filteredBySchedule, filteredData, sortKey, sortDirection]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 inline" />;
    }

    return sortDirection === 'asc'
      ? <ArrowUp className="ml-1 h-4 w-4 inline" />
      : <ArrowDown className="ml-1 h-4 w-4 inline" />;
  };

  return (
    <AuthGuard requiredRole="ADMIN">
      <div className="mt-6 w-full">
        <div className="mb-4 flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-transparent bg-transparent"
          />
          {/* Filtro por horario */}
          <MultiSelect
            className=''
            options={scheduleOptions}
            defaultValue={selectedDays}
            onValueChange={setSelectedDays}
            placeholder="Filtrar por horario"
            variant="inverted"
          />
        </div>
        {/* Desktop/table view */}
        <div
          className="hidden md:block bg-white shadow rounded-lg overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 justify-center items-center">
          <table className="min-w-full table-auto divide-y">
            <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">#</th>
              <th
                className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                onClick={() => handleSort('name')}
              >
               <span className="inline-flex items-center">
                Nombre
                <SortIcon column="name" />
              </span>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                onClick={() => handleSort('present')}
              >
               <span className="inline-flex items-center">
                Asistencia
                <SortIcon column="present" />
              </span>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                onClick={() => handleSort('absent')}
              >
               <span className="inline-flex items-center">
                Deuda
                <SortIcon column="absent" />
              </span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Tombola</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Objetos</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Convocatoria</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Numero</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Horario</th>
              <th
                className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                onClick={() => handleSort('birthday')}
              >
               <span className="inline-flex items-center">
                Cumpleaños
                <SortIcon column="birthday" />
              </span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-4 py-6 text-center text-sm text-gray-500">No hay datos para el
                  rango seleccionado.
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr key={row.id} className='hover:bg-gray-300'>
                  <td className="px-4 py-3 text-sm ">{index + 1}</td>
                  <td className="px-4 py-3 text-sm">{row.name}</td>
                  <td className="px-4 py-3 text-center text-sm">{row.attendances.PRESENT ?? 0}</td>

                  {/*Deuda*/}
                  <td className="px-4 py-3 text-center text-sm">{row.attendances.ABSENT ?? 0}</td>

                  {/*Tombola*/}
                  <td className="px-4 py-3 text-center text-sm">-</td>

                  {/*Objetos*/}
                  <td className="px-4 py-3 text-center text-sm">-</td>

                  {/*Convocatoria*/}
                  <td className="px-4 py-3 text-center text-sm">-</td>

                  {/*Numero*/}
                  <td className="px-4 py-3 text-sm">{row?.phone}</td>

                  {/*Horario*/}
                  <td className="px-4 py-3 text-sm">
                    {row?.groupMembers
                      ?.map(member => member.group?.dayOfWeek)
                      .filter(Boolean)
                      .join(', ')}
                  </td>

                  {/*Cumpleaños*/}
                  <td className="px-4 py-3 text-sm">
                    {
                      row?.birthday
                        ? format(row.birthday, "yyyy-MM-dd")
                        : '-'
                    }
                  </td>

                  {/*Acciones*/}
                  <td className="px-4 py-1 text-sm">
                    <ButtonActions volunteer={row} />
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>

        {/* Mobile/card view */}
        {
          isMobile && (
            <div className="md:hidden flex flex-col gap-3">
              {sortedData.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-4 text-center text-sm text-gray-500">No hay datos para el rango
                  seleccionado.</div>
              ) : (
                sortedData.map((row, index) => (
                  <article key={row.id} className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{row.name}</div>
                          <div className="text-xs text-gray-500">#{index + 1}</div>
                        </div>
                        <div className="text-sm text-gray-600 break-words">{row.email}</div>
                        {showPhone && <div className="text-sm text-gray-600">{row.phone}</div>}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-lg font-semibold">Total</div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {ATTENDANCE_STATUSES.map((s) => (
                        <div key={s} className="bg-gray-50 rounded-md p-2 text-center">
                          <div className="text-xs text-gray-500">{STATUS_LABELS[s]}</div>
                          <div className="text-sm font-medium">{0}</div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          )
        }
      </div>
    </AuthGuard>
  );
}
