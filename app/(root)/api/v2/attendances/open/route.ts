import {NextResponse} from "next/server";
import {getAuthPayload} from "@/lib/get-auth";
import {createAttendancesForToday} from "@/features/attendances/actions/create-attendances-for-today-by-email";

export async function POST(req: Request) {
  try {
    const payload = await getAuthPayload(req)

    const result = await createAttendancesForToday(payload.email);
    if (!result.success) {
      return NextResponse.json(
        { message: "Algo ha sucedido" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {data: result},
      {status: 200}
    )
  } catch (err) {
    console.error("[ERROR_POST_CREATE_ATTENDANCES]", err)
    return NextResponse.json(
      { message: "Token inválido o expirado" },
      { status: 401 }
    );
  }
}
