import TableOfAttendances from "@/features/admin/components/table-of-attendances";
import {
  getVolunteersWithAttendancesForAdmin,
} from "@/features/admin/actions/get-volunteers-with-attendances-for-admin";
import {InitialAttendanceModal} from "@/features/admin/components/modals/initial-attendance-modal";
import {ScheduleVolunteerModal} from "@/features/admin/components/modals/schedule-of-volunteer-modal";
import {ChangeUserRoleModal} from "@/features/admin/components/modals/change-user-role-modal";

export default async function Page() {
  const {groups, volunteers} = await getVolunteersWithAttendancesForAdmin();

  return (
    <>
      <div className="flex">
        <TableOfAttendances data={volunteers}/>
      </div>
      <InitialAttendanceModal/>
      <ScheduleVolunteerModal groups={groups}/>
      <ChangeUserRoleModal />
    </>
  );
}
