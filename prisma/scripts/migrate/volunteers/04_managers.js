import {GroupRole, PrismaClient, UserRole, WeekDay} from "@prisma/client";

const prisma = new PrismaClient();


const volunteers = [
  {
    email: "adu@gmail.com",
    day: WeekDay.LUNES,
  }
]

async function main() {
  try {
    for (const volunteer of volunteers) {
      const volunteer = await prisma.volunteer.findUnique({
        where: {
          email: volunteer.email
        },
      })
      if (!volunteer) {
        console.log("[VOLUNTEER_NOT_FOUND]", volunteer.email);
        continue;
      }

      const groupByDay = await prisma.group.findFirst({
        where: {
          dayOfWeek: volunteer.day,
          deletedAt: null,
        }
      })
      if (!groupByDay) {
        console.log("[GROUP_DAY_NOT_FOUND]", volunteer.day);
        continue;
      }

      const existingGroupMember = await prisma.groupMember.findFirst({
        where: {
          volunteerId: volunteer.id,
          groupId: groupByDay.id
        },
        include: {
          volunteer: true
        }
      })
      if (existingGroupMember) {
        await prisma.groupMember.update({
          where: {
            id: existingGroupMember.id
          },
          data: {
            role: GroupRole.LEADER
          },
        })
        await prisma.user.update({
          where: {
            volunteerId: volunteer.id
          },
          data: {
            role: UserRole.MANAGER
          }
        })
        console.log("[SUCCESS_VOLUNTEER]", volunteer.email);
        continue;
      }

      const newGroupMember = await prisma.groupMember.create({
        data: {
          groupId: groupByDay.id,
          volunteerId: volunteer.id,
          role: GroupRole.LEADER,
        }
      })
      if (!newGroupMember) {
        console.log("[ERROR_CREATE_GROUP_MEMBER_ID]", groupByDay.id);
        continue;
      }

      await prisma.user.update({
        where: {
          volunteerId: volunteer.id
        },
        data: {
          role: UserRole.MANAGER
        }
      })
      console.log("[SUCCESS_VOLUNTEER]", volunteer.email);
    }
  } catch (error) {
    console.error("[ERROR_VOLUNTEER_TO_MANAGERS]:",error);
  }
}

main()
  .catch((err) => {
    console.error("❌ Error en seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
