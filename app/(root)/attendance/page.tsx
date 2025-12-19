import AttendanceList from "@/features/attendances/components/attendance-list";
import {getAttendancesAndVolunteers} from "@/features/attendances/actions/get-attendances";
import {getServerTime} from "@/lib/get-server-time";
import {getVolunteerOfFreeDaySetting} from "@/features/attendances/actions/get-volunteer-of-free-day-setting";

export const revalidate = 10;

export default async function VolunteersPage() {
  const volunteers = await getAttendancesAndVolunteers();
  const volunteerMap = volunteers.map(v => v.id);

  const volunteersFreeDaySetting = await getVolunteerOfFreeDaySetting(volunteerMap);
  const serverTime = getServerTime();

  return (
    <div className="space-y-2">
      <AttendanceList
        volunteers={volunteers}
        serverTime={serverTime}
        volunteersFreeDaySetting={volunteersFreeDaySetting}
      />
    </div>
  );
}
