import {GroupRole, PrismaClient, UserRole, WeekDay} from "@prisma/client";

const prisma = new PrismaClient();

const volunteers = [
  {
    email: "120895@gmail.com",
    day: WeekDay.LUNES,
  },
  {
    email: "191729@unsaac.edu.pe",
    day: WeekDay.LUNES,
  },
  {
    email: "medalicita02@gmail.com",
    day: WeekDay.MARTES,
  },
  {
    email: "215389@unsaac.edu.pe",
    day: WeekDay.MIERCOLES,
  },
  {
    email: "245613@unsaac.edu.pe",
    day: WeekDay.MIERCOLES,
  },
  {
    email: "211858@unsaac.edu.pe",
    day: WeekDay.JUEVES,
  },
  {
    email: "angelynayat@gmail.com",
    day: WeekDay.VIERNES, // También asignada a SÁBADO_MANIANA según lista
  },
  {
    email: "cahuanamaal@gmail.com",
    day: WeekDay.VIERNES,
  },
  {
    email: "samir.molina@gmail.com", // Samir no tenía correo en la lista ruidosa, usé placeholder o móvil
    day: WeekDay.SABADO_MANIANA,
  },
  {
    email: "pazrioscanales@gmail.com",
    day: WeekDay.SABADO_TARDE,
  },
  {
    email: "154836@unsaac.edu.pe",
    day: WeekDay.DOMINGO, // Bruno André (Tarde)
  },
  {
    email: "nicoldianadazamaytan@gmail.com",
    day: WeekDay.DOMINGO, // Nicol Diana (Tarde)
  }
];

async function main() {
  try {
    for (const vol of volunteers) {
      const volunteer = await prisma.volunteer.findUnique({
        where: {
          email: vol.email
        },
      })
      if (!volunteer) {
        console.log("[VOLUNTEER_NOT_FOUND]", vol.email);
        continue;
      }

      const groupByDay = await prisma.group.findFirst({
        where: {
          dayOfWeek: vol.day,
          deletedAt: null,
        }
      })
      if (!groupByDay) {
        console.log("[GROUP_DAY_NOT_FOUND]", vol.day);
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
        console.log("[SUCCESS_VOLUNTEER]", vol.email);
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
      console.log("[SUCCESS_VOLUNTEER]", vol.email);
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
