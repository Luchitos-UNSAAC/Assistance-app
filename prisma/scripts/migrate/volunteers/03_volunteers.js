import fs from "fs";
import csv from "csv-parser";
import dayjs from "dayjs";
import { PrismaClient, UserRole, WeekDay } from "@prisma/client";

const prisma = new PrismaClient();

// ===== CONFIG =====
const CSV_PATH = "./volunteers_15122025.csv";
const CALL_ID = "cmj7qoxna00002w815g8tiuhz";
const DEFAULT_PASSWORD = "TEMP_PASSWORD";
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
}

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

    for (const row of rows) {
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
        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: DEFAULT_PASSWORD,
                name: fullName,
                role: UserRole.VOLUNTEER,
            },
        });

        const normalizedArea = normalizeArea(row.AREA);
        const areaId = AREA_MAP[normalizedArea] || undefined;

        const cumple = row.CUMPLE ? dayjs(row.CUMPLE).toDate() : null;

        const volunteerData = {
            name: fullName,
            email: email,
            phone: row.CELULAR,
            address: "",
            birthday: cumple,
            user: {
                connect: { id: user.id },
            },
        };

        if (areaId) {
            volunteerData.area = { connect: { id: areaId } };
        }

        // 2️⃣ VOLUNTEER
        const volunteer = await prisma.volunteer.upsert({
            where: { email: email },
            update: {},
            create: volunteerData,
        });

        // 3️⃣ CALL PARTICIPANT
        const participant = await prisma.callParticipant.upsert({
            where: {
                volunteerId_callId: {
                    volunteerId: volunteer.id,
                    callId: CALL_ID,
                },
            },
            update: {},
            create: {
                volunteerId: volunteer.id,
                callId: CALL_ID,
            },
        });

        // 4️⃣ CALL SCHEDULE + PARTICIPANT SCHEDULE
        const days = row.HORARIOS
            ? row.HORARIOS.split(",").map((d) => d.trim())
            : [];

        for (const day of days) {
            const weekDay = weekDayMap[day];

            if (!weekDay) {
                console.warn(`⚠️ Día inválido: ${day}`);
                continue;
            }

            const schedule = await prisma.callSchedule.findFirst({
                where: {
                    callId: CALL_ID,
                    dayOfWeek: weekDay,
                },
            });

            if (!schedule) {
                console.warn(`⚠️ No existe schedule para ${weekDay}`);
                continue;
            }

            await prisma.callParticipantSchedule.create({
                data: {
                    participantId: participant.id,
                    scheduleId: schedule.id,
                },
            });

            const groupId = GROUP_BY_DAY[weekDay];
            if (!groupId) continue;

            await prisma.groupMember.upsert({
                where: {
                    groupId_volunteerId: {
                        groupId,
                        volunteerId: volunteer.id,
                    },
                },
                update: {},
                create: {
                    groupId,
                    volunteerId: volunteer.id,
                    role: "MEMBER",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        }

        console.log(`✅ Procesado: ${email}`);
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
