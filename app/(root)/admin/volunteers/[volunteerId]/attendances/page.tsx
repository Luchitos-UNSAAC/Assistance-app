import {getVolunteersWithAttendancesForAdmin} from "@/features/admin/actions/get-attendances-by-volunteer-id-for-admin";
import VolunteerAttendancesForAdmin from "@/features/admin/components/volunteer-attendances-for-admin";

interface VolunteerAttendancesProps {
  params: Promise<{ volunteerId: string }>;
}

export default async function Page({params}: VolunteerAttendancesProps) {
  const {volunteerId} = await params;
  const data = await getVolunteersWithAttendancesForAdmin(volunteerId)
  if (!data) {
    return (
      <div className="flex">
        No data found
      </div>
    )
  }

  return (
    <div className="flex">
      <VolunteerAttendancesForAdmin data={data}/>
    </div>
  )
}
