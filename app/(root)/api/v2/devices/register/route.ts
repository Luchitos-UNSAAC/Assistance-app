import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/get-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const payload = await getAuthPayload(req);
    const body = await req.json();

    const {
      deviceId,
      platform,
      osVersion,
      model,
      brand,
      appVersion,
      pushToken,
    } = body;

    if (!deviceId || !platform) {
      return NextResponse.json(
        { message: "deviceId y platform son obligatorios" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      null;

    const device = await prisma.device.upsert({
      where: {
        deviceId,
      },
      update: {
        platform,
        osVersion,
        model,
        brand,
        appVersion,
        pushToken,
        lastIp: ip,
        lastActiveAt: new Date(),
        userId: payload.userId,
        isActive: true,
      },
      create: {
        deviceId,
        platform,
        osVersion,
        model,
        brand,
        appVersion,
        pushToken,
        lastIp: ip,
        lastActiveAt: new Date(),
        userId: payload.userId,
      },
    });

    return NextResponse.json(
      {
        data: device,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DEVICE_REGISTER_ERROR", error);

    return NextResponse.json(
      { message: "No autorizado o token inválido" },
      { status: 401 }
    );
  }
}
