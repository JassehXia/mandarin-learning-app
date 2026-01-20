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
    console.log("Starting deep seed for Learning Tree...");

    // 1. Clear ALL existing data
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.flashcard.deleteMany();
    await prisma.scenario.deleteMany();
    await prisma.character.deleteMany();
    await prisma.user.deleteMany();

    console.log("Data cleared.");

    // 2. Create Characters
    const c = {
        zhang: await prisma.character.create({
            data: { name: "Driver Zhang", role: "Taxi Driver", personalityPrompt: "Friendly but impatient Shanghai taxi driver." }
        }),
        auntie: await prisma.character.create({
            data: { name: "Auntie Wang", role: "Food Vendor", personalityPrompt: "Loud, enthusiastic dumpling stall owner." }
        }),
        mei: await prisma.character.create({
            data: { name: "Mei", role: "Boba Clerk", personalityPrompt: "Trendy, high-energy bubble tea clerk." }
        }),
        li: await prisma.character.create({ data: { name: "Li Jie", role: "Store Clerk", personalityPrompt: "Busy but helpful grocery clerk." } }),
        chen: await prisma.character.create({ data: { name: "Mr. Chen", role: "Local", personalityPrompt: "Kind elderly man who knows the area." } }),
        xiao: await prisma.character.create({ data: { name: "Xiao Ming", role: "Friend", personalityPrompt: "Casual, flexible friend using slang." } }),
        manager: await prisma.character.create({ data: { name: "Manager Lin", role: "Receptionist", personalityPrompt: "Formal, polite hotel manager." } }),
        lao: await prisma.character.create({ data: { name: "Lao Li", role: "Vendor", personalityPrompt: "Crafty souvenir vendor who loves to bargain." } }),
    };

    console.log("Characters created.");

    // 3. Create Root Scenario
    const greetings = await prisma.scenario.create({
        data: {
            title: "First Encounters",
            description: "You meet Mr. Chen in a park. Practice basic greetings and introduce yourself.",
            objective: "Say hello, tell him your name, and ask how he is.",
            difficulty: "Beginner",
            location: "City Park",
            characterId: c.chen.id,
            pathway: "Core",
            x: 50, y: 5,
            keyPhrases: [
                { phrase: "你好", pinyin: "Nǐ hǎo", translation: "Hello" } as any,
                { phrase: "我叫...", pinyin: "Wǒ jiào...", translation: "My name is..." } as any
            ]
        }
    });

    // 4. Branch: Food & Ordering
    const boba = await prisma.scenario.create({
        data: {
            title: "Boba Craving",
            description: "Order a pearl milk tea from Mei.",
            objective: "Specify your sugar and ice levels.",
            difficulty: "Beginner",
            location: "Tea Shop",
            characterId: c.mei.id,
            pathway: "Food",
            x: 30, y: 25,
            prerequisites: { connect: [{ id: greetings.id }] },
            keyPhrases: [{ phrase: "珍珠奶茶", pinyin: "Zhēnzhū nǎichá", translation: "Pearl milk tea" }] as any
        }
    });

    const market = await prisma.scenario.create({
        data: {
            title: "Market Master",
            description: "Buy fresh ingredients from Li Jie.",
            objective: "Ask for the price and quantity of apples.",
            difficulty: "Beginner",
            location: "Grocery Store",
            characterId: c.li.id,
            pathway: "Food",
            x: 20, y: 45,
            prerequisites: { connect: [{ id: boba.id }] },
            keyPhrases: [] as any
        }
    });

    const dumpling = await prisma.scenario.create({
        data: {
            title: "Auntie's Dumplings",
            description: "Order specialized dumplings from Auntie Wang.",
            objective: "Order pork dumplings and ask for spicy sauce.",
            difficulty: "Intermediate",
            location: "Night Market",
            characterId: c.auntie.id,
            pathway: "Food",
            x: 15, y: 65,
            prerequisites: { connect: [{ id: market.id }] },
            keyPhrases: [] as any
        }
    });

    // 5. Branch: Travel & Directions
    const taxi = await prisma.scenario.create({
        data: {
            title: "Taxi to the Bund",
            description: "Tell Driver Zhang where you need to go.",
            objective: "State destination and ask if he uses the meter.",
            difficulty: "Beginner",
            location: "Airport",
            characterId: c.zhang.id,
            pathway: "Travel",
            x: 70, y: 25,
            prerequisites: { connect: [{ id: greetings.id }] },
            keyPhrases: [] as any
        }
    });

    const hotel = await prisma.scenario.create({
        data: {
            title: "The Grand Check-in",
            description: "Check into your hotel with Manager Lin.",
            objective: "Confirm your reservation and get your room key.",
            difficulty: "Beginner",
            location: "Hotel Lobby",
            characterId: c.manager.id,
            pathway: "Travel",
            x: 80, y: 45,
            prerequisites: { connect: [{ id: taxi.id }] },
            keyPhrases: [] as any
        }
    });

    const directions = await prisma.scenario.create({
        data: {
            title: "Lost in Translation",
            description: "Ask a local for directions to the nearest bank.",
            objective: "Understand path directions (left, right, straight).",
            difficulty: "Intermediate",
            location: "Old Town",
            characterId: c.chen.id,
            pathway: "Travel",
            x: 85, y: 65,
            prerequisites: { connect: [{ id: hotel.id }] },
            keyPhrases: [] as any
        }
    });

    // 6. Branch: Social
    const friend = await prisma.scenario.create({
        data: {
            title: "Coffee with Xiao Ming",
            description: "Meet your friend for a chat.",
            objective: "Talk about your weekend plans.",
            difficulty: "Intermediate",
            location: "Cafe",
            characterId: c.xiao.id,
            pathway: "Social",
            x: 50, y: 40,
            prerequisites: { connect: [{ id: greetings.id }] },
            keyPhrases: [] as any
        }
    });

    // 7. Advanced Merged Nodes
    const bargaining = await prisma.scenario.create({
        data: {
            title: "Market Hustle",
            description: "Negotiate a price with Lao Li for a silk scarf.",
            objective: "Get a 50% discount using bargaining tactics.",
            difficulty: "Intermediate",
            location: "Silk Market",
            characterId: c.lao.id,
            pathway: "Social",
            x: 40, y: 80,
            prerequisites: { connect: [{ id: dumpling.id }, { id: friend.id }] },
            keyPhrases: [] as any
        }
    });

    const emergency = await prisma.scenario.create({
        data: {
            title: "Lost Passport",
            description: "Explain a complex situation to a police officer.",
            objective: "Describe lost items and last known location.",
            difficulty: "Advanced",
            location: "Police Station",
            characterId: c.zhang.id, // Using Zhang as a placeholder or create a new one
            pathway: "Travel",
            x: 65, y: 80,
            prerequisites: { connect: [{ id: directions.id }, { id: friend.id }] },
            keyPhrases: [] as any
        }
    });

    const dinner = await prisma.scenario.create({
        data: {
            title: "The Final Toast",
            description: "Host a dinner party for all your new friends.",
            objective: "Make a toast and thank everyone for their help.",
            difficulty: "Advanced",
            location: "Banquet Hall",
            characterId: c.manager.id,
            pathway: "General",
            x: 50, y: 95,
            prerequisites: { connect: [{ id: bargaining.id }, { id: emergency.id }] },
            keyPhrases: [] as any
        }
    });

    console.log("Learning Tree seeded successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });