import {NextResponse} from "next/server";
import {getAuthPayload} from "@/lib/get-auth";
import {getAttendancesAndVolunteersByEmail} from "@/features/attendances/actions/get-attendances-by-email";
import {getVolunteerOfFreeDaySetting} from "@/features/attendances/actions/get-volunteer-of-free-day-setting";
import {getServerTime} from "@/lib/get-server-time";
import {getVolunteerGroupedToday} from "@/features/volunteers/actions/get-volunteer-grouped-today-by-email";
import {Attendance} from "@/lib/store";

export async function GET(req: Request) {
  try {
    const payload = await getAuthPayload(req)
    const result = await getVolunteerGroupedToday(payload.email);
    if (!result) {
      return NextResponse.json(
        { message: "Algo ha sucedido" },
        { status: 400 }
      );
    }
    const {volunteers} = result;

    const attendancesAll: Attendance[] = []

    volunteers.forEach((volunteer) => {
      volunteer.attendances.forEach((attendance) => {
        attendancesAll.push(attendance)
      })
    })

    // TODO: new volunteers
    const volunteersByScheduleToday: any[] = []

    const data = {
      attendances: attendancesAll,
      volunteers,
      newVolunteers: volunteersByScheduleToday,
    }
    return NextResponse.json(
      {data},
      {status: 200}
    )
  } catch (err) {
    console.error("[ERROR_GET_DASHBOARD]", err)
    return NextResponse.json(
      { message: "Token inválido o expirado" },
      { status: 401 }
    );
  }
}
