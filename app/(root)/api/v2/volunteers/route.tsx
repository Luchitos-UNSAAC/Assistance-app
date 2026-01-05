import {NextResponse} from "next/server";
import {getAuthPayload} from "@/lib/get-auth";
import {getVolunteerGroupedToday} from "@/features/volunteers/actions/get-volunteer-grouped-today-by-email";
import {Attendance} from "@/lib/store";
import {AddManagerBody, addVolunteerV2} from "@/features/volunteers/actions/add-volunteer-v2";

export async function GET(req: Request) {
  try {
    const payload = await getAuthPayload(req)
    const result = await getVolunteerGroupedToday(payload.email);
    if (!result) {
      return NextResponse.json(
        {message: "Algo ha sucedido"},
        {status: 400}
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
      {message: "Token inválido o expirado"},
      {status: 401}
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = await getAuthPayload(req);
    const body = await req.json();
    const {name, email, phone, address, dni, birthday, status, day} = body;

    if (!name) {
      return NextResponse.json(
        {message: "name es requerido"},
        {status: 400}
      );
    }

    if (!email) {
      return NextResponse.json(
        {message: "email es requerido"},
        {status: 400}
      );
    }

    if (!address) {
      return NextResponse.json(
        {message: "address es requerido"},
        {status: 400}
      );
    }

    if (!dni) {
      return NextResponse.json(
        {message: "dni es requerido"},
        {status: 400}
      );
    }

    if (!phone) {
      return NextResponse.json(
        {message: "phone es requerido"},
        {status: 400}
      );
    }

    if (!birthday) {
      return NextResponse.json(
        {message: "birthday es requerido"},
        {status: 400}
      );
    }

    if (!status) {
      return NextResponse.json(
        {message: "status es requerido"},
        {status: 400}
      );
    }

    if (!day) {
      return NextResponse.json(
        {message: "day es requerido"},
        {status: 400}
      );
    }

    const bodyCreateVolunteer: AddManagerBody = {
      name,
      email,
      phone,
      address,
      dni,
      birthday,
      day,
      status
    }

    const result = await addVolunteerV2(payload.email, bodyCreateVolunteer);
    if (!result.success) {
      return NextResponse.json(
        {message: "Algo ha sucedido"},
        {status: 500}
      );
    }

    return NextResponse.json({ data: result }, { status: 200 });

  } catch (e) {
    console.error("[ERROR_CREATE_VOLUNTEER]", e);
    return NextResponse.json(
      {message: "Token inválido o expirado"},
      {status: 401}
    );
  }
}
