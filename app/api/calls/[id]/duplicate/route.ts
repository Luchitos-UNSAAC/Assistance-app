import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const original = await prisma.callForVolunteers.findUnique({
      where: { id: id },
      include: { callSchedules: true },
    });
    
    if (!original) {
      return NextResponse.json({ error: "Convocatoria no encontrada" }, { status: 404 });
    }
    
    const duplicated = await prisma.callForVolunteers.create({
      data: {
        title: `${original.title} (Copia)`,
        description: original.description,
        location: original.location,
        modality: original.modality,
        requirements: original.requirements,
        benefits: original.benefits,
        deadline: original.deadline,
        status: "OPEN",
        createdBy: original.createdBy,
        
        callSchedules: {
          create: original.callSchedules.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            onDate: s.onDate,
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        },
      },
      include: { callSchedules: true },
    });
    
    return NextResponse.json(duplicated, { status: 201 });
  } catch (error: any) {
    console.error("Error duplicating call:", error);
    return NextResponse.json(
      { error: error?.message || "Error al duplicar la convocatoria" },
      { status: 500 }
    );
  }
}
