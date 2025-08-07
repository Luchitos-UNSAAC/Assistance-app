import { PrismaClient, UserRole, VolunteerStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create volunteer
  const volunteer = await prisma.volunteer.upsert({
    where: { id: "cme0a14ef000307if8zy60hp9" },
    update: {},
    create: {
      id: "cme0a14ef000307if8zy60hp9",
      name: "Ana García",
      email: "admin@unsaac.edu",
      phone: "+5191919191919",
      address: "San Jeronimo D-4 La CANTUTA",
      birthday: new Date("2025-08-06T13:03:00.000Z"),
      status: VolunteerStatus.ACTIVE,
      createdAt: new Date("2025-08-06T13:03:50.000Z"),
      updatedAt: new Date("2025-08-06T13:03:51.000Z"),
    },
  });

  // Create user and link to volunteer
  await prisma.user.upsert({
    where: { id: "cme09w21z000007if6wg7fxfk" },
    update: {},
    create: {
      id: "cme09w21z000007if6wg7fxfk",
      email: "admin@unsaac.edu",
      password: "123456", // ⚠️ Consider hashing this in production
      name: "Ana García",
      role: UserRole.ADMIN,
      createdAt: new Date("2025-08-06T13:00:04.000Z"),
      updatedAt: new Date("2025-08-06T13:00:04.000Z"),
      volunteerId: volunteer.id,
    },
  });

  console.log("✅ Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
