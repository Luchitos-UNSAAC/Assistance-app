'use client';

import React, {useMemo} from 'react';
import {VolunteerWithAttendancesByStatus} from "@/features/admin/actions/get-volunteers-with-attendances-for-admin";
import {ArrowDown, ArrowUp, ArrowUpDown, Edit} from "lucide-react";
import AuthGuard from "@/components/auth-guard";
import {MultiSelect} from "@/components/ui/multi-select";
import {ButtonActions} from "@/features/admin/components/button-actions";
import {formatDate, formatRoleLabel, getVolunteerSchedule, ROLE_LABELS, WEEK_DAY_LABELS} from "@/features/admin/utils";
import {Badge} from "@/components/ui/badge";

type SortDirection = 'asc' | 'desc';

type SortKey =
  | 'name'
  | 'present'
  | 'absent'
  | 'birthday';

export default function TableOfAttendances({data}: { data: VolunteerWithAttendancesByStatus[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey>('name');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');
  const [search, setSearch] = React.useState('');
  const [selectedDays, setSelectedDays] = React.useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);

  // Opciones de Selectores (Memorizadas)
  const roleOptions = useMemo(() => Object.entries(ROLE_LABELS).map(([value, label]) => ({value, label})), []);
  const scheduleOptions = useMemo(() => Object.entries(WEEK_DAY_LABELS).map(([value, label]) => ({value, label})), []);

  // Handlers
  const handleSort = (key: SortKey) => {
    setSortDirection(prev => (sortKey === key && prev === 'asc' ? 'desc' : 'asc'));
    setSortKey(key);
  };

  // Pipeline de Filtrado y Ordenamiento
  const processedData = useMemo(() => {
    return data
      .filter(row => {
        const matchesSearch = row.name.toLowerCase().includes(search.toLowerCase());
        const matchesRole = selectedRoles.length === 0 || (row.user?.role && selectedRoles.includes(row.user.role));
        const matchesSchedule = selectedDays.length === 0 || row.groupMembers?.some(m => m.group?.dayOfWeek && selectedDays.includes(m.group.dayOfWeek));
        return matchesSearch && matchesRole && matchesSchedule;
      })
      .sort((a, b) => {
        let aVal: any = sortKey === 'name' ? a.name.toLowerCase() :
          sortKey === 'birthday' ? (a.birthday ? new Date(a.birthday).getTime() : 0) :
            (a.attendances[sortKey.toUpperCase() as keyof typeof a.attendances] ?? 0);

        let bVal: any = sortKey === 'name' ? b.name.toLowerCase() :
          sortKey === 'birthday' ? (b.birthday ? new Date(b.birthday).getTime() : 0) :
            (b.attendances[sortKey.toUpperCase() as keyof typeof b.attendances] ?? 0);

        return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });
  }, [data, search, selectedRoles, selectedDays, sortKey, sortDirection]);

  // Sub-componente de Icono para limpieza visual en el Header
  const SortIcon = ({column}: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30 inline"/>;
    return sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3 inline"/> :
      <ArrowDown className="ml-1 h-3 w-3 inline"/>;
  };

  return (
    <AuthGuard requiredRole="ADMIN">
      <div className="mt-6 w-full space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Voluntarios</h1>
          <p className="text-muted-foreground text-sm">Gestión centralizada de miembros y asistencias.</p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="flex h-10 w-full md:w-72 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MultiSelect options={scheduleOptions} onValueChange={setSelectedDays} placeholder="Horario"
                       variant="inverted"/>
          <MultiSelect options={roleOptions} onValueChange={setSelectedRoles} placeholder="Rol" variant="inverted"/>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
            <tr>
              <th className="p-4 w-12">#</th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('name')}>
                Nombre <SortIcon column="name"/>
              </th>
              <th className="p-4 text-center cursor-pointer" onClick={() => handleSort('present')}>
                Asist. <SortIcon column="present"/>
              </th>
              <th className="p-4 text-center cursor-pointer" onClick={() => handleSort('absent')}>
                Faltas <SortIcon column="absent"/>
              </th>
              <th className="p-4">Correo</th>
              <th className="p-4">Horario</th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('birthday')}>
                Cumpleaños <SortIcon column="birthday"/>
              </th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
            </thead>
            <tbody className="divide-y">
            {processedData.map((row, i) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 text-muted-foreground">{i + 1}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{row.name}</span>
                    {row.user?.role !== 'VOLUNTEER' && (
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {formatRoleLabel(row.user?.role)}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-4 text-center font-medium">{row.attendances.PRESENT ?? 0}</td>
                <td className="p-4 text-center font-medium">{row.attendances.ABSENT ?? 0}</td>
                <td className="p-4 text-muted-foreground">{row.email}</td>
                <td className="p-4">{getVolunteerSchedule(row)}</td>
                <td className="p-4">{formatDate(row.birthday)}</td>
                <td className="p-4 text-right">
                  <ButtonActions volunteer={row}/>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (Simplified with formatters) */}
        <div className="md:hidden space-y-3">
          {processedData.map((row, i) => (
            <article key={row.id} className="p-4 border rounded-xl bg-card space-y-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{row.name}</h3>
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                </div>
                <ButtonActions volunteer={row}/>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px]">{formatRoleLabel(row.user?.role)}</Badge>
                <span className="text-[10px] text-muted-foreground">ID: #{i + 1}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-muted/50 rounded-lg text-center">
                  <p className="text-[10px] uppercase text-muted-foreground">Presentes</p>
                  <p className="font-bold text-primary">{row.attendances.PRESENT ?? 0}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg text-center">
                  <p className="text-[10px] uppercase text-muted-foreground">Faltas</p>
                  <p className="font-bold text-destructive">{row.attendances.ABSENT ?? 0}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
