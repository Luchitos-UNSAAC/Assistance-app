import VolunteersList from "@/features/volunteers/components/volunteer-list";
import {getActiveVolunteers} from "@/features/volunteers/actions/get-active-volunteers";
import {Attendance} from "@/lib/store";

export default async function VolunteersPage() {
  const activeVolunteers = await getActiveVolunteers();
  const attendancesAll: Attendance[]  = []
  
  // Join all the attendances for stats
  activeVolunteers.forEach((volunteer) => {
    volunteer.attendances.forEach((attendance) => {
      attendancesAll.push(attendance)
    })
  })
  
  return (
    <VolunteersList
      attendances={attendancesAll}
      volunteers={activeVolunteers}
    />
  )
}