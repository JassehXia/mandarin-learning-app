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
    console.log("Starting deep seed for Multiple Pathways...");

    // 1. Clear ALL existing data
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.flashcard.deleteMany();
    await prisma.scenario.deleteMany();
    await prisma.pathway.deleteMany();
    await prisma.character.deleteMany();
    await prisma.user.deleteMany();

    console.log("Data cleared.");

    // 2. Create Characters
    const c = {
        zhang: await prisma.character.create({ data: { name: "Driver Zhang", role: "Taxi Driver", personalityPrompt: "Friendly but impatient Shanghai taxi driver." } }),
        auntie: await prisma.character.create({ data: { name: "Auntie Wang", role: "Food Vendor", personalityPrompt: "Loud, enthusiastic dumpling stall owner." } }),
        mei: await prisma.character.create({ data: { name: "Mei", role: "Boba Clerk", personalityPrompt: "Trendy, high-energy bubble tea clerk." } }),
        li: await prisma.character.create({ data: { name: "Li Jie", role: "Store Clerk", personalityPrompt: "Busy but helpful grocery clerk." } }),
        chen: await prisma.character.create({ data: { name: "Mr. Chen", role: "Local", personalityPrompt: "Kind elderly man who knows the area." } }),
        xiao: await prisma.character.create({ data: { name: "Xiao Ming", role: "Friend", personalityPrompt: "Casual, flexible friend using slang." } }),
        manager: await prisma.character.create({ data: { name: "Manager Lin", role: "Receptionist", personalityPrompt: "Formal, polite hotel manager." } }),
        lao: await prisma.character.create({ data: { name: "Lao Li", role: "Vendor", personalityPrompt: "Crafty souvenir vendor who loves to bargain." } }),
        teacher: await prisma.character.create({ data: { name: "Teacher Zhang", role: "Professor", personalityPrompt: "Patient but firm Chinese language teacher." } }),
        student: await prisma.character.create({ data: { name: "Wei Wei", role: "Classmate", personalityPrompt: "Friendly and helpful international student." } }),
        relative: await prisma.character.create({ data: { name: "Uncle Wong", role: "Elder Relative", personalityPrompt: "Traditional, warm-hearted uncle who loves asking about your life." } }),
    };

    console.log("Characters created.");

    // 3. Create Pathways
    const p = {
        life: await prisma.pathway.create({
            data: {
                title: "A Day in the Life",
                description: "Navigate common daily tasks from morning to night.",
                icon: "Sun",
                order: 1
            }
        }),
        school: await prisma.pathway.create({
            data: {
                title: "A School Day",
                description: "Experience life on a Chinese campus.",
                icon: "School",
                order: 2
            }
        }),
        cny: await prisma.pathway.create({
            data: {
                title: "Chinese New Year",
                description: "Celebrate the most important festival in China.",
                icon: "Gift",
                order: 3
            }
        })
    };

    console.log("Pathways created.");

    // --- PATHWAY 1: A DAY IN THE LIFE ---
    const breakfast = await prisma.scenario.create({
        data: {
            title: "Morning Jīnbǐng",
            description: "Buy breakfast from a street stall.",
            objective: "Order a savory pancake with cilantro and extra chili.",
            difficulty: "Beginner",
            location: "Street Corner",
            characterId: c.auntie.id,
            pathwayId: p.life.id,
            x: 50, y: 5,
        }
    });

    const commute = await prisma.scenario.create({
        data: {
            title: "Dìdidǎchē",
            description: "Call a ride-share to your office.",
            objective: "Confirm your destination and ask about traffic.",
            difficulty: "Beginner",
            location: "Sidewalk",
            characterId: c.zhang.id,
            pathwayId: p.life.id,
            x: 50, y: 25,
            prerequisites: { connect: [{ id: breakfast.id }] }
        }
    });

    const coffee = await prisma.scenario.create({
        data: {
            title: "The Coffee Run",
            description: "Get your caffeine fix before the big meeting.",
            objective: "Order an iced latte with oat milk.",
            difficulty: "Beginner",
            location: "Cafe",
            characterId: c.mei.id,
            pathwayId: p.life.id,
            x: 30, y: 50,
            prerequisites: { connect: [{ id: commute.id }] }
        }
    });

    const dinner = await prisma.scenario.create({
        data: {
            title: "Hot Pot Dinner",
            description: "Meet Xiao Ming for dinner.",
            objective: "Discuss your day and order spicy broth.",
            difficulty: "Intermediate",
            location: "Hot Pot Restaurant",
            characterId: c.xiao.id,
            pathwayId: p.life.id,
            x: 70, y: 50,
            prerequisites: { connect: [{ id: commute.id }] }
        }
    });

    const grocery = await prisma.scenario.create({
        data: {
            title: "Night Market Groceries",
            description: "Pick up fruit on the way home.",
            objective: "Bargain for the freshest peaches.",
            difficulty: "Intermediate",
            location: "Local Market",
            characterId: c.lao.id,
            pathwayId: p.life.id,
            x: 50, y: 80,
            prerequisites: { connect: [{ id: coffee.id }, { id: dinner.id }] }
        }
    });

    // --- PATHWAY 2: A SCHOOL DAY ---
    const registration = await prisma.scenario.create({
        data: {
            title: "Student Reg",
            description: "Register for your new semester.",
            objective: "Confirm your major and get your ID card.",
            difficulty: "Beginner",
            location: "Admin Building",
            characterId: c.manager.id,
            pathwayId: p.school.id,
            x: 50, y: 10,
        }
    });

    const classFinding = await prisma.scenario.create({
        data: {
            title: "Finding Class",
            description: "You're late for your first lecture.",
            objective: "Ask a student for directions to Room 302.",
            difficulty: "Beginner",
            location: "Campus Hallway",
            characterId: c.student.id,
            pathwayId: p.school.id,
            x: 50, y: 35,
            prerequisites: { connect: [{ id: registration.id }] }
        }
    });

    const library = await prisma.scenario.create({
        data: {
            title: "Library Silence",
            description: "Try to borrow a textbook.",
            objective: "Ask if you can borrow the book for two weeks.",
            difficulty: "Intermediate",
            location: "University Library",
            characterId: c.manager.id,
            pathwayId: p.school.id,
            x: 80, y: 65,
            prerequisites: { connect: [{ id: classFinding.id }] }
        }
    });

    const club = await prisma.scenario.create({
        data: {
            title: "Join the Club",
            description: "Inquire about the Wushu club.",
            objective: "Ask about the meeting times and requirements.",
            difficulty: "Intermediate",
            location: "Gymnasium",
            characterId: c.teacher.id, // Professor/Teacher type
            pathwayId: p.school.id,
            x: 20, y: 65,
            prerequisites: { connect: [{ id: classFinding.id }] }
        }
    });

    // --- PATHWAY 3: CHINESE NEW YEAR ---
    const preparations = await prisma.scenario.create({
        data: {
            title: "Feast Prep",
            description: "Buy decorations and food with Uncle Wong.",
            objective: "Pick out red lanterns and fish for the dinner.",
            difficulty: "Beginner",
            location: "Shopping Street",
            characterId: c.relative.id,
            pathwayId: p.cny.id,
            x: 50, y: 15,
        }
    });

    const greetings = await prisma.scenario.create({
        data: {
            title: "红包 (Hóngbāo)",
            description: "Visit relatives and give New Year greetings.",
            objective: "Say 'Xinnian Kuaile' and receive a red envelope.",
            difficulty: "Beginner",
            location: "Traditional Courtyard",
            characterId: c.relative.id,
            pathwayId: p.cny.id,
            x: 50, y: 45,
            prerequisites: { connect: [{ id: preparations.id }] }
        }
    });

    const templeFair = await prisma.scenario.create({
        data: {
            title: "Temple Fair",
            description: "Explore the bustling lunar fair.",
            objective: "Buy a tiger-head hat and try tanghulu.",
            difficulty: "Intermediate",
            location: "Temple Fair",
            characterId: c.auntie.id,
            pathwayId: p.cny.id,
            x: 50, y: 75,
            prerequisites: { connect: [{ id: greetings.id }] }
        }
    });

    console.log("Deep seed for Multiple Pathways completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });