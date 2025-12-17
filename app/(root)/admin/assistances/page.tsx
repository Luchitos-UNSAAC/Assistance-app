import TableOfAttendances from "@/features/admin/components/table-of-attendances";
import {
  getVolunteersWithAttendancesForAdmin,
  VolunteerWithAttendancesByStatus
} from "@/features/admin/actions/get-volunteers-with-attendances-for-admin";

export default async function Page() {
  const volunteersWithAttendance: VolunteerWithAttendancesByStatus[] = await getVolunteersWithAttendancesForAdmin();

  return (
    <div className="flex">
      <TableOfAttendances data={volunteersWithAttendance} />
    </div>
  );
}
