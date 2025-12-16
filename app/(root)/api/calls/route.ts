// app/api/calls/route.ts
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

type ScheduleInput = {
  mode: "WEEKLY" | "ONCE";
  dayOfWeek?: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
  onDate?: string;     // yyyy-mm-dd
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
};

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

function parseTimeToDate(timeHHmm: string): Date {
  // base arbitraria para horarios semanales
  return new Date(`1970-01-01T${timeHHmm}`);
}

function combineDateAndTime(dateYYYYmmdd: string, timeHHmm: string): Date {
  return new Date(`${dateYYYYmmdd}T${timeHHmm}`);
}

function isStartBeforeEnd(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return sh * 60 + sm < eh * 60 + em;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validaciones básicas del payload
    if (!body?.title || !body?.description) {
      return bad("Faltan campos obligatorios (title, description).");
    }
    if (!body?.deadline) {
      return bad("deadline es obligatorio.");
    }
    if (!Array.isArray(body?.schedules) || body.schedules.length === 0) {
      return bad("Debes enviar al menos un horario.");
    }

    const schedulesMapped = (body.schedules as ScheduleInput[]).map((s, idx) => {
      if (!s.startTime || !s.endTime) {
        throw new Error(`Horario #${idx + 1}: falta startTime/endTime`);
      }
      if (!isStartBeforeEnd(s.startTime, s.endTime)) {
        throw new Error(`Horario #${idx + 1}: la hora de inicio debe ser menor que la de fin`);
      }

      if (s.mode === "WEEKLY") {
        if (!s.dayOfWeek) throw new Error(`Horario #${idx + 1}: dayOfWeek es obligatorio en modo WEEKLY`);
        return {
          dayOfWeek: s.dayOfWeek,
          onDate: null,
          startTime: parseTimeToDate(s.startTime),
          endTime: parseTimeToDate(s.endTime),
        };
      } else {
        if (!s.onDate) throw new Error(`Horario #${idx + 1}: onDate es obligatorio en modo ONCE`);
        return {
          dayOfWeek: null,
          onDate: new Date(`${s.onDate}T00:00`),
          startTime: combineDateAndTime(s.onDate, s.startTime),
          endTime: combineDateAndTime(s.onDate, s.endTime),
        };
      }
    });

    const call = await prisma.callForVolunteers.create({
      data: {
        title: body.title,
        description: body.description,
        location: body.location || null,
        modality: body.modality,
        requirements: body.requirements || null,
        benefits: body.benefits || null,
        deadline: new Date(body.deadline),
        status: body.status,
        createdBy: "system", // TODO: tomar del usuario autenticado

        callSchedules: {
          create: schedulesMapped,
        },
      },
      include: {
        callSchedules: true,
      },
    });

    return NextResponse.json(call, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || "Error al crear la convocatoria" },
      { status: 500 }
    );
  }
}
