import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {getAuthPayload} from "@/lib/get-auth";

export async function GET(req: Request) {
  try {
    // 🔐 Verificar JWT
    const payload = await getAuthPayload(req)

    // 🔎 Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: user,
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
