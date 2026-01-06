import { getAuthPayload } from "@/lib/get-auth";
import { NextResponse } from "next/server";
import {
  deleteVolunteerByIdV2
} from "@/features/volunteers/actions/delete-volunteer-by-id-v2";

type VolunteerIdProps = { params: { volunteerId: string } }

export async function DELETE(req: Request, { params }: VolunteerIdProps) {
  try {
    const payload = await getAuthPayload(req)
    const { volunteerId } = params;

    const result = await deleteVolunteerByIdV2(volunteerId, payload.email);
    if (!result) {
      return NextResponse.json(
        { message: "Algo ha sucedido" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {data: result},
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

