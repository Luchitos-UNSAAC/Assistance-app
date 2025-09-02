import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const call = await prisma.callForVolunteers.update({
      where: { id: id },
      data: { status: "CLOSED" },
    });
    
    return NextResponse.json(call, { status: 200 });
  } catch (error: any) {
    console.error("Error closing call:", error);
    return NextResponse.json(
      { error: error?.message || "Error al cerrar la convocatoria" },
      { status: 500 }
    );
  }
}
