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
    
    if (body?.id) {
      const existingQuestion = await prisma.callQuestion.findFirst({
        where: {
          callId,
          id: body.id,
        },
      });
      
      if (existingQuestion) {
        const updatedQuestion = await prisma.callQuestion.update({
          where: { id: existingQuestion.id },
          data: {
            question: question.text || existingQuestion.question,
            type,
            required,
            options,
            order,
          },
        });
        
        return NextResponse.json(updatedQuestion, { status: 200 });
      }
      
      return NextResponse.json(
        { error: "Question not found" },
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId"); // id de la pregunta
    
    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }
    
    // Verificar que la pregunta existe y pertenece al call
    const existingQuestion = await prisma.callQuestion.findFirst({
      where: {
        id: questionId,
        callId: id,
      },
    });
    
    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }
    
    // Eliminar la pregunta
    await prisma.callQuestion.delete({
      where: { id: existingQuestion.id },
    });
    
    return NextResponse.json(
      { message: "Question deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}