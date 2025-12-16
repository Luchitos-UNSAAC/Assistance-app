import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AREAS = [
    {
        id: "cmj7smaby00002w53zchjyyc8",
        name: "TALENTO HUMANO",
        description: "Área de gestión y desarrollo del talento humano",
        createdAt: new Date("2025-12-15 23:36:46.799"),
        updatedAt: new Date("2025-12-15 23:36:46.799"),
        deletedAt: null,
    },
    {
        id: "cmj7smac300012w53jj0vf46q",
        name: "EMERGENCIAS",
        description: "Área de atención y respuesta ante emergencias",
        createdAt: new Date("2025-12-15 23:36:46.803"),
        updatedAt: new Date("2025-12-15 23:36:46.803"),
        deletedAt: null,
    },
    {
        id: "cmj7smac800022w53vzbhflxw",
        name: "REDES SOCIALES",
        description: "Área de gestión de redes sociales y comunicación digital",
        createdAt: new Date("2025-12-15 23:36:46.809"),
        updatedAt: new Date("2025-12-15 23:36:46.809"),
        deletedAt: null,
    },
    {
        id: "cmj7smacd00032w53scsyunwv",
        name: "DESARROLLO Y RECAUDACION DE FONDOS_ACTIVIDADES",
        description: "Área de desarrollo institucional y recaudación de fondos",
        createdAt: new Date("2025-12-15 23:36:46.813"),
        updatedAt: new Date("2025-12-15 23:36:46.813"),
        deletedAt: null,
    },
    {
        id: "cmj7smacj00042w53y4f8cdy4",
        name: "FINANZAS",
        description: "Área de administración financiera",
        createdAt: new Date("2025-12-15 23:36:46.819"),
        updatedAt: new Date("2025-12-15 23:36:46.819"),
        deletedAt: null,
    },
];

async function main() {
    console.log("🚀 Iniciando seed determinístico de áreas...\n");

    for (const area of AREAS) {
        await prisma.area.upsert({
            where: { id: area.id },
            create: area,
            update: {
                name: area.name,
                description: area.description,
                updatedAt: area.updatedAt,
                deletedAt: area.deletedAt,
            },
        });

        console.log(`✅ Área sincronizada: ${area.name}`);
    }

    console.log("\n🎉 Seed de áreas completado correctamente");
}

main()
    .catch((error) => {
        console.error("❌ Error en seed de áreas:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
