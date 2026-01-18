import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting seed...");

    // Clear existing data (optional, be careful in prod)
    // await prisma.message.deleteMany();
    // await prisma.conversation.deleteMany();
    // await prisma.scenario.deleteMany();
    // await prisma.character.deleteMany();

    console.log("Creating Test Character...");
    const driverZhang = await prisma.character.create({
        data: {
            name: "Driver Zhang",
            role: "Taxi Driver",
            personalityPrompt: "You are a friendly but slightly impatient taxi driver in Shanghai. You speak Mandarin. You love to talk about the weather and food. You want to know where the passenger is going. If they don't negotiate the price or ask for the meter, you might try to overcharge them slightly (but playfully). Your goal is to get them to their destination.",
        }
    });

    console.log("Creating Test Scenario...");
    const airportScenario = await prisma.scenario.create({
        data: {
            title: "Pudong Airport Arrival",
            description: "You have just landed in Shanghai. You need to take a taxi to your hotel on the Bund. Find a taxi and tell the driver where you want to go.",
            objective: "Successfully communicate your destination (The Bund / Waitan) and get into the taxi.",
            difficulty: "Beginner",
            location: "Airport",
            characterId: driverZhang.id,
        }
    });

    console.log("Seeding completed.");
    console.log("Created Scenario:", airportScenario.title);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });