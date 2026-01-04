import { NextResponse } from "next/server";
import {getAuthPayload} from "@/lib/get-auth";
import {getProfileVolunteerByEmail} from "@/features/profile/actions/get-profile-volunteer-by-email";

export async function GET(req: Request) {
  try {
    const payload = await getAuthPayload(req)
    const profile = await getProfileVolunteerByEmail(payload.email);
    const data = {
      profile,
    }

    return NextResponse.json(
      {
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ME_ERROR", error);

    return NextResponse.json(
      { message: "Token inválido o expirado" },
      { status: 401 }
    );
  }
}
