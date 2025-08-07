import AttendanceList from "@/features/attendances/components/attendance-list";
import {getAttendancesAndVolunteers} from "@/features/attendances/actions/get-attendances";
import {getServerTime} from "@/lib/get-server-time";

export default async function VolunteersPage() {
  const { volunteers, attendances } = await getAttendancesAndVolunteers()
  const serverTime = getServerTime()
  return (
    <AttendanceList
        attendances={attendances}
        volunteers={volunteers}
        serverTime={serverTime}
    />
  )
}