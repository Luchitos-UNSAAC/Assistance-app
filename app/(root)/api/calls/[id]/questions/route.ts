import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const callId = id;
    const body = await req.json();
    
    const { question, type, required = true, options = [], order = 0 } = body;
    
    const call = await prisma.callForVolunteers.findUnique({
      where: { id: callId },
    });
    
    if (!call) {
      return NextResponse.json(
        { error: "Call not found" },
        { status: 404 }
      );
    }
    
    const newQuestion = await prisma.callQuestion.create({
      data: {
        question,
        type,
        required,
        options,
        order,
        callId,
      },
    });
    
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
