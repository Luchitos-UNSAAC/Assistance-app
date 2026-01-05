import { getAuthPayload } from "@/lib/get-auth";
import { NextResponse } from "next/server";
import {EditAttendanceBody, editAttendanceById} from "@/features/attendances/actions/edit-attendance-by-id-and-email";

type UpdateAttendanceProps = { params: { attendanceId: string } }

export async function PUT(req: Request, { params }: UpdateAttendanceProps) {

  try {
    const payload = await getAuthPayload(req);

    const { attendanceId } = params;

    if(!attendanceId) {
      return NextResponse.json(
        { message: "attendanceId es requerido" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {volunteerId, date, status} = body;

    if (!volunteerId) {
      return NextResponse.json(
        { message: "volunteerId es requerido" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { message: "date es requerido" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { message: "requerido es requerido" },
        { status: 400 }
      );
    }

    const updateBody: EditAttendanceBody = {
      volunteerId: body.volunteerId,
      date: body.data,
      status: body.status,
    }

    const result = await editAttendanceById(
      attendanceId,
      payload.email,
      updateBody
    );
    if (!result.success) {
      return NextResponse.json(
        { message: "No se pudo actualizar la asistencia" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    console.error("[ERROR_PUT_ATTENDANCE]", err);
    return NextResponse.json(
      { message: "Token inválido o error del servidor" },
      { status: 401 }
    );
  }

}
