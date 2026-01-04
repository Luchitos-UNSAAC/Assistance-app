import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateJWT } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Correo y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // 🔐 Buscar usuario
    const userExists = await prisma.user.findFirst({
      where: { email },
    });

    if (!userExists) {
      return NextResponse.json(
        { message: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // ⚠️ TODO: bcrypt.compare(password, userExists.password)
    if (password !== userExists.password) {
      return NextResponse.json(
        { message: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // 🔑 Generar JWT
    const token = await generateJWT({
      userId: userExists.id,
      email: userExists.email,
      role: userExists.role,
    });

    return NextResponse.json(
      {
        data: {
          token,
        },
        message: "Login successful",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("LOGIN_ERROR", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
