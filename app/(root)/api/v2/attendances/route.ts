import {NextResponse} from "next/server";
import {getAuthPayload} from "@/lib/get-auth";
import {getAttendancesAndVolunteersByEmail} from "@/features/attendances/actions/get-attendances-by-email";
import {getVolunteerOfFreeDaySetting} from "@/features/attendances/actions/get-volunteer-of-free-day-setting";
import {getServerTime} from "@/lib/get-server-time";

export async function GET(req: Request) {
  try {
    const payload = await getAuthPayload(req)
    const result = await getAttendancesAndVolunteersByEmail(payload.email);
    if (!result) {
      return NextResponse.json(
        { message: "Algo ha sucedido" },
        { status: 400 }
      );
    }
    const {volunteersForSelect, isPossibleToMarkAttendances, todayWeekDay} = result;

    const volunteerMap = volunteersForSelect.map(v => v.id);
    const volunteersFreeDaySetting = await getVolunteerOfFreeDaySetting(volunteerMap)
    const serverTime = getServerTime();

    const data = {
      volunteers: volunteersForSelect,
      serverTime,
      volunteersFreeDaySetting,
      isPossibleToMarkAttendances,
      todayWeekDay
    }
    return NextResponse.json(
      {data: data},
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
