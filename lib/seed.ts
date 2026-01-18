import { PrismaClient, Prisma } from "@/app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in the environment variables.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting seed...");

    // Example: Create a new user
    const stage = await prisma.stage.create({
        data: {
            name: "Airport",
            level: 1,

        },
    });

    console.log("Stage user:", stage);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });