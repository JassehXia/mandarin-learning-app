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
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.scenario.deleteMany();
    await prisma.character.deleteMany();

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

    console.log("Creating Grocery Store Character...");
    const liJie = await prisma.character.create({
        data: {
            name: "Li Jie",
            role: "Store Clerk",
            personalityPrompt: "You are Li Jie, a helpful but busy clerk at a local grocery store. You are currently stocking shelves. You speak standard Mandarin. You know where everything is. If someone asks for bananas (xiāngjiāo), you should point them to the fruit section near the entrance. You are polite but efficient.",
        }
    });

    console.log("Creating Grocery Store Scenario...");
    await prisma.scenario.create({
        data: {
            title: "The Fruit Quest",
            description: "You're in a large grocery store and really need some bananas for a recipe. The store is crowded, and you're not sure where the fruit section is. Ask a clerk for help.",
            objective: "Find Li Jie and successfully ask for the location of bananas (xiāngjiāo).",
            difficulty: "Beginner",
            location: "Grocery Store",
            characterId: liJie.id,
        }
    });

    console.log("Creating Friend Character...");
    const xiaoMing = await prisma.character.create({
        data: {
            name: "Xiao Ming",
            role: "Friend",
            personalityPrompt: "You are Xiao Ming, a close friend of the user. You are casual, use common slang like 'yo' or 'zěnme yàng', and are very flexible with plans. You speak informal Mandarin. You're happy to hang out but want to make sure you have a clear plan. If the user doesn't suggest a specific time or place, you should ask for clarification.",
        }
    });

    console.log("Creating Texting Scenario...");
    await prisma.scenario.create({
        data: {
            title: "Weekend Plans",
            description: "You're texting your friend Xiao Ming to hang out this weekend. You need to agree on a specific date, a time, and a place to meet.",
            objective: "Coordinate with Xiao Ming and set a specific date, time, and location for your meeting.",
            difficulty: "Intermediate",
            location: "Messaging App",
            characterId: xiaoMing.id,
        }
    });

    console.log("Creating Passerby Character...");
    const mrChen = await prisma.character.create({
        data: {
            name: "Mr. Chen",
            role: "Local Inhabitant",
            personalityPrompt: "You are Mr. Chen, a kind elderly man who has lived in this neighborhood for 40 years. You are very polite and speak clearly. You know every nook and cranny of the area. If someone asks for the nearest coffee shop (kāfēi diàn), you should give them detailed directions (e.g., 'go straight, turn left at the bank').",
        }
    });

    console.log("Creating Cafe Directions Scenario...");
    await prisma.scenario.create({
        data: {
            title: "Morning Caffeine",
            description: "You're lost in a new neighborhood and desperately need a coffee. You see a friendly-looking local, Mr. Chen, sitting on a bench. Ask him for directions.",
            objective: "Successfully ask Mr. Chen for directions to the nearest coffee shop (kāfēi diàn) and acknowledge his instructions.",
            difficulty: "Beginner",
            location: "City Street",
            characterId: mrChen.id,
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