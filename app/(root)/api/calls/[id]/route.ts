import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { id } = params;
    
    // Validaciones básicas
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
    
    // ✅ update con recreación de schedules
    const updatedCall = await prisma.callForVolunteers.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        location: body.location || null,
        modality: body.modality,
        requirements: body.requirements || null,
        benefits: body.benefits || null,
        deadline: new Date(body.deadline),
        status: body.status,
        updatedBy: "system", // TODO: autenticación real
        callSchedules: {
          deleteMany: {}, // eliminamos los anteriores
          create: schedulesMapped, // y creamos los nuevos
        },
      },
      include: {
        callSchedules: true,
      },
    });
    
    return NextResponse.json(updatedCall, { status: 200 });
  } catch (error: any) {
    console.error("[PUT_CALL_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Error al actualizar la convocatoria" },
      { status: 500 }
    );
  }
}
