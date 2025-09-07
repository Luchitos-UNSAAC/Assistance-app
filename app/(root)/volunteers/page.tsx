import VolunteersList from "@/features/volunteers/components/volunteer-list";
import {getVolunteerGroupedToday} from "@/features/volunteers/actions/get-volunteer-grouped-today";
import {Attendance} from "@/lib/store";
import {getVolunteerByScheduleToday} from "@/features/volunteers/actions/get-volunteer-by-schedule-today";

export default async function VolunteersPage() {
  const activeVolunteers = await getVolunteerGroupedToday();
  const volunteersByScheduleToday = await getVolunteerByScheduleToday()
  const attendancesAll: Attendance[]  = []
  console.log("volunteersByScheduleToday:", volunteersByScheduleToday)
  console.log("activeVolunteers:", activeVolunteers)
  
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
