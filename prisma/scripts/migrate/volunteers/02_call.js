import { PrismaClient, WeekDay, Modality, CallStatus } from "@prisma/client";
import dayjs from "dayjs";

const prisma = new PrismaClient();

// ================= CONFIG =================
const CALL_ID = "cmj7qoxna00002w815g8tiuhz";

const CALL_DATA = {
    id: CALL_ID,
    title: "MIGRATION-01",
    description: "MIGRATION-01-DESCRIPTION",
    location: "UNSAAC",
    modality: Modality.PRESENTIAL,
    deadline: new Date("2025-12-31T00:00:00.000Z"),
    status: CallStatus.OPEN,
    createdBy: "system",
};

const BASE_DATE = "1970-01-01";

const SCHEDULES = [
    { day: WeekDay.LUNES, start: "21:00", end: "23:00" },
    { day: WeekDay.MARTES, start: "21:00", end: "23:00" },
    { day: WeekDay.MIERCOLES, start: "21:00", end: "23:00" },
    { day: WeekDay.JUEVES, start: "21:00", end: "23:00" },
    { day: WeekDay.VIERNES, start: "21:00", end: "23:00" },
    { day: WeekDay.SABADO_TARDE, start: "21:00", end: "23:00" },
    { day: WeekDay.SABADO_MANIANA, start: "14:30", end: "17:00" },
    { day: WeekDay.DOMINGO, start: "21:00", end: "23:00" },
];
// =========================================

function timeToDate(time) {
    return dayjs(`${BASE_DATE} ${time}`).toDate();
}

async function main() {
    // 1️⃣ CALL FOR VOLUNTEERS
    const call = await prisma.callForVolunteers.upsert({
        where: { id: CALL_ID },
        update: {},
        create: CALL_DATA,
    });

    console.log("✅ CallForVolunteers creado:", call.id);

    // 2️⃣ CALL SCHEDULES
    for (const s of SCHEDULES) {
        const exists = await prisma.callSchedule.findFirst({
            where: {
                callId: CALL_ID,
                dayOfWeek: s.day,
                startTime: timeToDate(s.start),
                endTime: timeToDate(s.end),
            },
        });

        if (exists) {
            console.log(`↪️ Schedule ya existe: ${s.day} ${s.start}-${s.end}`);
            continue;
        }

        await prisma.callSchedule.create({
            data: {
                callId: CALL_ID,
                dayOfWeek: s.day,
                startTime: timeToDate(s.start),
                endTime: timeToDate(s.end),
            },
        });

        console.log(`➕ Schedule creado: ${s.day} ${s.start}-${s.end}`);
    }

    console.log("🎉 Migración de call y schedules completada");
}

main()
    .catch((e) => {
        console.error("❌ Error en migración:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
