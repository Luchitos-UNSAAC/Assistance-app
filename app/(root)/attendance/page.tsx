import AttendanceList from "@/features/attendances/components/attendance-list";
import { getAttendancesAndVolunteers } from "@/features/attendances/actions/get-attendances";
import { getServerTime } from "@/lib/get-server-time";

export const revalidate = 10;

export default async function VolunteersPage() {
  const volunteers = await getAttendancesAndVolunteers();
  const serverTime = getServerTime();
  
  return (
    <div className="space-y-4">
      <AttendanceList
        volunteers={volunteers}
        serverTime={serverTime}
      />
    </div>
  );
}
