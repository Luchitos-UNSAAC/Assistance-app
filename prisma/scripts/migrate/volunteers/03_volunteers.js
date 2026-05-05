import fs from "fs";
import csv from "csv-parser";
import dayjs from "dayjs";
import {PrismaClient, UserRole, WeekDay} from "@prisma/client";

const prisma = new PrismaClient();

// ===== CONFIG =====
// const CSV_PATH = "./volunteers_15122025.csv";
const CSV_PATH = "./new_list.csv";
const CALL_ID = "cmj7qoxna00002w815g8tiuhz";
const DEFAULT_PASSWORD = "TEMP_PASS";
// ===================

// Mapeo explícito a enum Prisma
const weekDayMap = {
  LUNES: WeekDay.LUNES,
  MARTES: WeekDay.MARTES,
  MIERCOLES: WeekDay.MIERCOLES,
  JUEVES: WeekDay.JUEVES,
  VIERNES: WeekDay.VIERNES,
  SABADO_TARDE: WeekDay.SABADO_TARDE,
  SABADO_MANIANA: WeekDay.SABADO_MANIANA,
  DOMINGO: WeekDay.DOMINGO,
};

const AREA_MAP = {
  "TALENTO HUMANO": "cmj7smaby00002w53zchjyyc8",
  "EMERGENCIAS": "cmj7smac300012w53jj0vf46q",
  "REDES SOCIALES": "cmj7smac800022w53vzbhflxw",
  "DESARROLLO Y RECAUDACION DE FONDOS_ACTIVIDADES": "cmj7smacd00032w53scsyunwv",
  "FINANZAS": "cmj7smacj00042w53y4f8cdy4",
  "INFORMATICA": "cmj7smacj00042w53y4f8cdy2",
  "ACTIVIDADES": "cmj7smacp00052w53k9z8n2x1",
  "ALIMENTACION": "cmj7smacv00062w53m1q7p5t9",
};

const GROUP_BY_DAY = {
  LUNES: "cmfahdfo300022w5x5i5bjzid",
  MARTES: "cmfk5777s00022w42hjmyrkt1",
  MIERCOLES: "cmfahdfo300042w5x7zk5inw8",
  JUEVES: "cmfahdsjr00062w5xus4xahd9",
  VIERNES: "cmfaiweqh000a2wdw90ifrgz4",
  SABADO_MANIANA: "cmfakwy4j000t2wdwqaz486wu",
  SABADO_TARDE: "cmfakwy4j000t2wdwqaz486wa",
  DOMINGO: "cmfk5777s00042w42rv6wcpc6",
};


async function readCsv(path) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

async function main() {
  const rows = await readCsv(CSV_PATH);
  // console.log(`📄 ${rows.length} registros encontrados`);
  let countAuxForImage = 1;

  for (const row of rows) {
    const urlForImage = `https://robohash.org/${countAuxForImage}?set=set4`
    // console.log(row)
    const rawNames =
      row['﻿NOMBRES'] ??
      row['NOMBRES'] ??
      row[' NOMBRES'] ??
      '';

    const rawLastNames = row.APELLIDOS ?? '';

    const fullName = `${rawNames} ${rawLastNames}`.trim();
    const email =
      row.CORREO && row.CORREO.trim() !== ""
        ? row.CORREO.trim().toLowerCase()
        : `${fullName.replace(/\s+/g, "").toLowerCase()}@gmail.com`;
    // 1️⃣ USER

    // const findUser = await prisma.user.findUnique({
    //   where: { email },
    // })
    // if (findUser) {
    //   console.log("[Ya existe este usuario]", findUser)
    //   return;
    // }

    const user = await prisma.user.upsert({
      where: {email},
      update: {},
      create: {
        email,
        password: DEFAULT_PASSWORD,
        name: fullName,
        role: UserRole.VOLUNTEER,
        avatar: urlForImage,
      },
    });

    const normalizedArea = normalizeArea(row.AREA);
    const areaId = AREA_MAP[normalizedArea] || undefined;

    let cumple = undefined

    console.log(row.CUMPLEANIOS || "No Cumple");
    if (row.CUMPLEANIOS) {
      const parsed = dayjs(row.CUMPLEANIOS)

      if (parsed.isValid()) {
        const birthYear = parsed.year()
        const currentYear = dayjs().year()

        // ❌ Si es del año actual o anterior → dato incorrecto
        if (birthYear < currentYear - 1) {
          cumple = parsed.startOf("day").toDate()
        }
      }
    }

    const volunteerData = {
      name: fullName,
      email,
      phone: "",
      address: "",
      birthday: cumple,
      createdBy: 'second_migration',
      user: {
        connect: {id: user.id},
      },
    }

    if (areaId) {
      volunteerData.area = {connect: {id: areaId}};
    }

    // 2️⃣ VOLUNTEER
    const volunteer = await prisma.volunteer.upsert({
      where: {email: email},
      update: {
        birthday: volunteerData.birthday,
      },
      create: volunteerData,
    });

    // 3️⃣ CALL PARTICIPANT
    // const participant = await prisma.callParticipant.upsert({
    //   where: {
    //     volunteerId_callId: {
    //       volunteerId: volunteer.id,
    //       callId: CALL_ID,
    //     },
    //   },
    //   update: {},
    //   create: {
    //     volunteerId: volunteer.id,
    //     callId: CALL_ID,
    //   },
    // });
    //
    // // 4️⃣ CALL SCHEDULE + PARTICIPANT SCHEDULE
    // const days = row.HORARIOS
    //   ? row.HORARIOS.split(",").map((d) => d.trim())
    //   : [];
    //
    // for (const day of days) {
    //   const weekDay = weekDayMap[day];
    //
    //   if (!weekDay) {
    //     console.warn(`⚠️ Día inválido: ${day}`);
    //     continue;
    //   }
    //
    //   const schedule = await prisma.callSchedule.findFirst({
    //     where: {
    //       callId: CALL_ID,
    //       dayOfWeek: weekDay,
    //     },
    //   });
    //
    //   if (!schedule) {
    //     console.warn(`⚠️ No existe schedule para ${weekDay}`);
    //     continue;
    //   }
    //
    //   await prisma.callParticipantSchedule.create({
    //     data: {
    //       participantId: participant.id,
    //       scheduleId: schedule.id,
    //     },
    //   });
    //
    //   const groupId = GROUP_BY_DAY[weekDay];
    //   if (!groupId) continue;
    //
    //   await prisma.groupMember.upsert({
    //     where: {
    //       groupId_volunteerId: {
    //         groupId,
    //         volunteerId: volunteer.id,
    //       },
    //     },
    //     update: {},
    //     create: {
    //       groupId,
    //       volunteerId: volunteer.id,
    //       role: "MEMBER",
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     },
    //   });
    // }
    countAuxForImage++;

    console.log(`✅ ACTUALIZADO: ${email}`);
  }

  console.log("🎉 Seed finalizado correctamente");
}

function normalizeArea(value) {
  if (!value) return null;

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}


main()
  .catch((err) => {
    console.error("❌ Error en seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
