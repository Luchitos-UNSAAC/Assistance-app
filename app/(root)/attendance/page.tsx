// app/volunteers/page.tsx  (o donde esté tu page.tsx)
import AttendanceList from "@/features/attendances/components/attendance-list";
import { getAttendancesAndVolunteers } from "@/features/attendances/actions/get-attendances";
import { getServerTime } from "@/lib/get-server-time";

export const revalidate = 10;

type Props = {
  searchParams?: { page?: string; pageSize?: string };
};

export default async function VolunteersPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const pageSize = Math.min(100, Number(searchParams?.pageSize) || 10);
  
  const { volunteers, attendances, pagination } = await getAttendancesAndVolunteers({ page, pageSize });
  const serverTime = getServerTime();
  
  return (
    <div className="space-y-4">
      <AttendanceList
        attendances={attendances}
        volunteers={volunteers}
        serverTime={serverTime}
        pagination={pagination}
      />
    </div>
  );
}
