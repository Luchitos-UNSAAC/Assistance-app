import AttendanceList from "@/features/attendances/components/attendance-list";
import {getAttendancesAndVolunteers} from "@/features/attendances/actions/get-attendances";
import {getServerTime} from "@/lib/get-server-time";
import {getVolunteerOfFreeDaySetting} from "@/features/attendances/actions/get-volunteer-of-free-day-setting";

export const revalidate = 10;

export default async function VolunteersPage() {
  const data = await getAttendancesAndVolunteers();
  if (!data) {
    return null;
  }
  const {volunteersForSelect, isPossibleToMarkAttendances} = data;

  const volunteerMap = volunteersForSelect.map(v => v.id);

  const volunteersFreeDaySetting = await getVolunteerOfFreeDaySetting(volunteerMap);
  const serverTime = getServerTime();

  return (
    <div className="space-y-2">
      <AttendanceList
        volunteers={volunteersForSelect}
        serverTime={serverTime}
        volunteersFreeDaySetting={volunteersFreeDaySetting}
        isPossibleToMarkAttendances={isPossibleToMarkAttendances}
      />
    </div>
  );
}
