import { PrismaClient, UserRole, VolunteerStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // === Ana García (ADMIN) ===
    const volunteerAna = await prisma.volunteer.upsert({
        where: { id: "cme0a14ef000307if8zy60hp9" },
        update: {},
        create: {
            id: "cme0a14ef000307if8zy60hp9",
            name: "Ana García",
            email: "admin@unsaac.edu.pe",
            phone: "+5191919191919",
            address: "San Jeronimo D-4 La CANTUTA",
            birthday: new Date("2025-08-06T13:03:00.000Z"),
            status: VolunteerStatus.ACTIVE,
            createdAt: new Date("2025-08-06T13:03:50.000Z"),
            updatedAt: new Date("2025-08-06T13:03:51.000Z"),
        },
    });

    await prisma.user.upsert({
        where: { id: "cme09w21z000007if6wg7fxfk" },
        update: {},
        create: {
            id: "cme09w21z000007if6wg7fxfk",
            email: "admin@unsaac.edu.pe",
            password: "123456", // ⚠️ Hash in production
            name: "Ana García",
            role: UserRole.ADMIN,
            createdAt: new Date("2025-08-06T13:00:04.000Z"),
            updatedAt: new Date("2025-08-06T13:00:04.000Z"),
            volunteerId: volunteerAna.id,
        },
    });

    // === María López (VOLUNTEER) ===
    const volunteerMaria = await prisma.volunteer.upsert({
        where: { id: "cme0volun0000307if8zy60hp1" },
        update: {},
        create: {
            id: "cme0volun0000307if8zy60hp1",
            name: "María López",
            email: "voluntario5@unsaac.edu.pe",
            phone: "+5192828282828",
            address: "Av. Cultura, Cusco",
            birthday: new Date("1999-04-12T10:00:00.000Z"),
            status: VolunteerStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    await prisma.user.upsert({
        where: { id: "cme0user0000307if8zy60hp2" },
        update: {},
        create: {
            id: "cme0user0000307if8zy60hp2",
            email: "voluntario5@unsaac.edu.pe",
            password: "123456", // ⚠️ Hash in production
            name: "María López",
            role: UserRole.VOLUNTEER,
            createdAt: new Date(),
            updatedAt: new Date(),
            volunteerId: volunteerMaria.id,
        },
    });

    // === Carlos Mendoza (MANAGER) ===
    const volunteerCarlos = await prisma.volunteer.upsert({
        where: { id: "cme0volun0000307if8zy60hp3" },
        update: {},
        create: {
            id: "cme0volun0000307if8zy60hp3",
            name: "Carlos Mendoza",
            email: "manager2@unsaac.edu.pe",
            phone: "+5193737373737",
            address: "Wanchaq, Cusco",
            birthday: new Date("1995-11-20T15:30:00.000Z"),
            status: VolunteerStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    await prisma.user.upsert({
        where: { id: "cme0user0000307if8zy60hp4" },
        update: {},
        create: {
            id: "cme0user0000307if8zy60hp4",
            email: "manager2@unsaac.edu.pe",
            password: "123456", // ⚠️ Hash in production
            name: "Carlos Mendoza",
            role: UserRole.MANAGER,
            createdAt: new Date(),
            updatedAt: new Date(),
            volunteerId: volunteerCarlos.id,
        },
    });

    console.log("✅ Seed completed successfully: Admin, Manager, Volunteer created");
}

main()
    .catch((e) => {
        console.error("❌ Error during seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
