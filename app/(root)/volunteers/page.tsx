import VolunteersList from "@/features/volunteers/components/volunteer-list";
import {getVolunteerGroupedToday} from "@/features/volunteers/actions/get-volunteer-grouped-today";
import {Attendance} from "@/lib/store";
import {getVolunteerByScheduleToday} from "@/features/volunteers/actions/get-volunteer-by-schedule-today";
import {redirect} from "next/navigation";

export default async function VolunteersPage() {
  const response = await getVolunteerGroupedToday();
  if (!response) {
    return redirect('/')
  }
  const {volunteers, todayWeekDay, isPossibleToMarkAttendances} = response;
  const volunteersByScheduleToday = await getVolunteerByScheduleToday()
  const attendancesAll: Attendance[] = []

  volunteers.forEach((volunteer) => {
    volunteer.attendances.forEach((attendance) => {
      attendancesAll.push(attendance)
    })
  })
  return (
    <VolunteersList
      attendances={attendancesAll}
      volunteers={volunteers}
      newVolunteers={volunteersByScheduleToday}
    />
  )
}
