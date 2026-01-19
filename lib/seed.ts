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

    console.log("Creating Food Vendor Character...");
    const auntieWang = await prisma.character.create({
        data: {
            name: "Auntie Wang",
            role: "Food Vendor",
            personalityPrompt: "You are Auntie Wang, an energetic owner of a dumpling stall at a buzzing night market in China. You speak loud, fast, and enthusiastic Mandarin. You are very proud of your dumplings (shuǐjiǎo). You always ask customers what filling they want: Pork & Chive (zhūròu jiǔcài), Shrimp (xiā rén), or Cabbage (báicài). You also ask if they want spicy sauce (làjiāo). If they order slowly, you might rush them gently because there is a line. Your goal is to sell them delicious food.",
            avatarUrl: "/avatars/auntie-wang.png" // Placeholder
        }
    });

    console.log("Creating Night Market Scenario...");
    const nightMarketScenario = await prisma.scenario.create({
        data: {
            title: "Night Market Feast",
            description: "You are starving at a night market. The smell of fresh dumplings is irresistible. Auntie Wang is looking at you expectantly.",
            objective: "Order a serving of dumplings with a specific filling (e.g., Pork & Chives) and successfully pay for it.",
            difficulty: "Intermediate",
            location: "Night Market",
            characterId: auntieWang.id,
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