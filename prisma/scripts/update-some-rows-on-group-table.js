import { PrismaClient, WeekDay } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const volunteerAna = await prisma.group.update({
        where: { id: "cmfk5777s00022w42hjmyrkt1" },
        data: {
            dayOfWeek: WeekDay.DOMINGO,
        }
    });

    console.log("✅ Correctly updated group:", volunteerAna);
}

main()
    .catch((e) => {
        console.error("❌ Error during seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
