import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // asegúrate de tenerlo en tu proyecto
import { callFormSchema } from "@/features/calls/validations/call-form-schema";
import { ParticipationStatus } from "@prisma/client";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    
    const data = callFormSchema.parse(body);
    const { email, fullName, dni, phoneNumber, address, birthDate, answers, schedules } = data;
    const { id: callId } = params;
    
    let volunteer = await prisma.volunteer.findUnique({ where: { email } });
    
    if (!volunteer) {
      volunteer = await prisma.volunteer.create({
        data: {
          email,
          name: fullName,
          phone: phoneNumber,
          address,
          birthday: new Date(birthDate),
        },
      });
    }
    
    // 2. Crear CallParticipant (si no existe)
    let participant = await prisma.callParticipant.findFirst({
      where: { volunteerId: volunteer.id, callId },
    });
    
    if (!participant) {
      participant = await prisma.callParticipant.create({
        data: {
          volunteerId: volunteer.id,
          role: "APPLICANT",
          status: ParticipationStatus.ENROLLED,
          callId,
        },
      });
    }
    
    // 3. Guardar respuestas
    const formattedAnswers = Object.entries(answers).map(([questionId, value]) => {
      if (Array.isArray(value)) {
        return value.map((opt) => ({
          participantId: participant!.id,
          questionId,
          selectedOptions: JSON.stringify([opt]),
        }));
      } else {
        return [
          {
            participantId: participant!.id,
            questionId,
            answer: value as string,
          },
        ];
      }
    }).flat();
    
    await prisma.callAnswer.createMany({
      data: formattedAnswers,
    });
    
    // 4. Guardar horarios
    const scheduleData = schedules.map((scheduleId: string) => ({
      participantId: participant!.id,
      scheduleId,
    }));
    
    await prisma.callParticipantSchedule.createMany({
      data: scheduleData,
      skipDuplicates: true,
    });
    
    return NextResponse.json({ ok: true, participantId: participant.id });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}
