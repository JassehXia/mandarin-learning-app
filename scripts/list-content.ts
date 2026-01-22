import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    const pathways = await prisma.pathway.findMany({
        include: {
            scenarios: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    x: true,
                    y: true
                }
            }
        },
        orderBy: { order: 'asc' }
    });

    console.log(JSON.stringify(pathways, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
