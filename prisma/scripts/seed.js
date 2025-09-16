import {PrismaClient} from "@prisma/client";
import {volunteers} from "./data/volunteers.js";
import {groups} from "./data/groups.js";

const prisma = new PrismaClient();


async function main() {
    // Add volunteers and users
    for (const volunteer of volunteers) {
        const {user, ...volunteerData} = volunteer;
        await prisma.$transaction(async (tx) => {
            await tx.volunteer.upsert({
                where: {id: volunteerData.id},
                update: {},
                create: volunteerData,
            });
            await tx.user.upsert({
                where: {id: user.id},
                update: {},
                create: user,
            });
        })
    }

    // Add groups
    for (const group of groups) {
        await prisma.group.upsert({
            where: {id: group.id},
            update: {},
            create: group,
        });
    }

    console.log("All done! 🌱" );
}

main()
    .catch((e) => {
        console.error("❌ Error during seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
