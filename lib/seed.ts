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
            keyPhrases: [
                { phrase: "我要去...", pinyin: "Wǒ yào qù...", translation: "I want to go to..." },
                { phrase: "外滩", pinyin: "Wàitān", translation: "The Bund" },
                { phrase: "多少钱？", pinyin: "Duōshǎo qián?", translation: "How much is it?" },
                { phrase: "打表吗？", pinyin: "Dǎbiǎo ma?", translation: "Do you use the meter?" }
            ]
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
    await prisma.scenario.create({
        data: {
            title: "Night Market Feast",
            description: "You are starving at a night market. The smell of fresh dumplings is irresistible. Auntie Wang is looking at you expectantly.",
            objective: "Order a serving of dumplings with a specific filling (e.g., Pork & Chives) and successfully pay for it.",
            difficulty: "Intermediate",
            location: "Night Market",
            characterId: auntieWang.id,
            keyPhrases: [
                { phrase: "我要一份饺子", pinyin: "Wǒ yào yī fèn jiǎozi", translation: "I want one serving of dumplings" },
                { phrase: "猪肉韭菜", pinyin: "Zhūròu jiǔcài", translation: "Pork & Chive" },
                { phrase: "不要辣", pinyin: "Bùyào là", translation: "No spicy sauce" },
                { phrase: "可以用微信吗？", pinyin: "Kěyǐ yòng Wēixìn ma?", translation: "Can I use WeChat (Pay)?" }
            ]
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
            keyPhrases: [
                { phrase: "请问...", pinyin: "Qǐngwèn...", translation: "Excuse me / May I ask..." },
                { phrase: "...在哪里？", pinyin: "...zài nǎlǐ?", translation: "Where is...?" },
                { phrase: "香蕉", pinyin: "Xiāngjiāo", translation: "Banana" },
                { phrase: "水果区", pinyin: "Shuǐguǒ qū", translation: "Fruit section" }
            ]
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
            keyPhrases: [
                { phrase: "你周末有空吗？", pinyin: "Nǐ zhōumò yǒu kòng ma?", translation: "Are you free this weekend?" },
                { phrase: "我们几点见面？", pinyin: "Wǒmen jǐ diǎn jiànmiàn?", translation: "What time shall we meet?" },
                { phrase: "在哪里见面？", pinyin: "Zài nǎlǐ jiànmiàn?", translation: "Where shall we meet?" },
                { phrase: "不见不散", pinyin: "Bùjiàn bùsàn", translation: "Be there or be square" }
            ]
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
            keyPhrases: [
                { phrase: "咖啡店", pinyin: "Kāfēi diàn", translation: "Coffee shop" },
                { phrase: "一直走", pinyin: "Yīzhí zǒu", translation: "Go straight" },
                { phrase: "左转 / 右转", pinyin: "Zuǒ zhuǎn / Yòu zhuǎn", translation: "Turn left / Turn right" },
                { phrase: "谢谢您的帮助", pinyin: "Xièxiè nín de bāngzhù", translation: "Thank you for your help" }
            ]
        }
    });

    // --- NEW SCENARIOS ---

    console.log("Creating Boba Shop Character...");
    const mei = await prisma.character.create({
        data: {
            name: "Mei",
            role: "Boba Shop Clerk",
            personalityPrompt: "You are Mei, a young and trendy clerk at a popular bubble tea shop. You speak with high energy and use modern slang. You're very busy and expect customers to know their sugar level (táng dù) and ice level (bīng dù). You're helpful if they are confused but prefer quick orders.",
        }
    });

    console.log("Creating Boba Order Scenario...");
    await prisma.scenario.create({
        data: {
            title: "The Perfect Pearl",
            description: "You're at a famous boba shop. The menu is huge, but you just want a classic pearl milk tea. Order it exactly how you like it.",
            objective: "Order a pearl milk tea (zhēnzhū nǎichá) and specify your sugar and ice preferences.",
            difficulty: "Beginner",
            location: "Milk Tea Shop",
            characterId: mei.id,
            keyPhrases: [
                { phrase: "珍珠奶茶", pinyin: "Zhēnzhū nǎichá", translation: "Pearl milk tea" },
                { phrase: "半糖", pinyin: "Bàn táng", translation: "Half sugar" },
                { phrase: "少冰", pinyin: "Shǎo bīng", translation: "Less ice" },
                { phrase: "打包", pinyin: "Dǎbāo", translation: "To go / Take away" }
            ]
        }
    });

    console.log("Creating Hotel Manager...");
    const managerLin = await prisma.character.create({
        data: {
            name: "Manager Lin",
            role: "Hotel Receptionist",
            personalityPrompt: "You are Manager Lin, a professional and extremely polite receptionist at a high-end hotel in Beijing. You speak formal Mandarin (using 'nín' instead of 'nǐ'). You are patient and detail-oriented. You need to verify the guest's name and reservation details.",
        }
    });

    console.log("Creating Hotel Check-in Scenario...");
    await prisma.scenario.create({
        data: {
            title: "Midnight Check-in",
            description: "You've just arrived at your hotel after a long flight. You're tired but need to check in. You have a reservation under your name.",
            objective: "Introduce yourself, state that you have a reservation (yùdìng), and successfully receive your room key.",
            difficulty: "Beginner",
            location: "Hotel Lobby",
            characterId: managerLin.id,
            keyPhrases: [
                { phrase: "我要办理入住", pinyin: "Wǒ yào bànlǐ rùzhù", translation: "I want to check in" },
                { phrase: "我有预订", pinyin: "Wǒ yǒu yùdìng", translation: "I have a reservation" },
                { phrase: "这是我的护照", pinyin: "Zhè shì wǒ de hùzhào", translation: "This is my passport" },
                { phrase: "房卡", pinyin: "Fáng kǎ", translation: "Room card / key" }
            ]
        }
    });

    console.log("Creating Pharmacist...");
    const pharmacistWang = await prisma.character.create({
        data: {
            name: "Pharmacist Wang",
            role: "Pharmacist",
            personalityPrompt: "You are Pharmacist Wang, a knowledgeable and cautious pharmacist. You speak in a calm, professional tone. You want to make sure the user is safe, so you might ask about their symptoms (zhèngzhuàng) before giving them medicine (yào).",
        }
    });

    console.log("Creating Pharmacy Scenario...");
    await prisma.scenario.create({
        data: {
            title: "The Headache Cure",
            description: "You woke up with a splitting headache. You find a local pharmacy (yuèfáng) and need to buy some pain relievers.",
            objective: "Describe your headache (tóutèng) to Pharmacist Wang and successfully purchase medicine.",
            difficulty: "Beginner",
            location: "Pharmacy",
            characterId: pharmacistWang.id,
            keyPhrases: [
                { phrase: "我头疼", pinyin: "Wǒ tóuténg", translation: "I have a headache" },
                { phrase: "止疼药", pinyin: "Zhǐténg yào", translation: "Painkiller" },
                { phrase: "怎么吃？", pinyin: "Zěnme chī?", translation: "How do I take it?" },
                { phrase: "一天三次", pinyin: "Yītiān sāncì", translation: "Three times a day" }
            ]
        }
    });

    console.log("Creating Market Vendor...");
    const laoLi = await prisma.character.create({
        data: {
            name: "Lao Li",
            role: "Souvenir Vendor",
            personalityPrompt: "You are Lao Li, a crafty and seasoned vendor at a Silk Market. You start with high prices and love to 'perform' the bargaining process. You are friendly but will act shocked if the user offers too low a price. You'll use phrases like 'too expensive' (tài guì le) and 'make it cheaper' (piányi yīdiǎn).",
        }
    });

    console.log("Creating Bargaining Scenario...");
    await prisma.scenario.create({
        data: {
            title: "The Art of the Deal",
            description: "You see a beautiful silk scarf that Lao Li says costs 500 RMB. That's way too much. Use your skills to get a better price.",
            objective: "Successfully negotiate with Lao Li to lower the price of the scarf and finalize the purchase at a fair rate.",
            difficulty: "Intermediate",
            location: "Souvenir Market",
            characterId: laoLi.id,
            keyPhrases: [
                { phrase: "太贵了！", pinyin: "Tài guì le!", translation: "Too expensive!" },
                { phrase: "便宜一点吧", pinyin: "Piányi yīdiǎn ba", translation: "Make it cheaper / Give me a discount" },
                { phrase: "最低多少钱？", pinyin: "Zuìdī duōshǎo qián?", translation: "What's the lowest price?" },
                { phrase: "那我不买了", pinyin: "Nà wǒ bù mǎi le", translation: "Then I won't buy it (walking away tactic)" }
            ]
        }
    });

    console.log("Creating Police Officer...");
    const officerGao = await prisma.character.create({
        data: {
            name: "Officer Gao",
            role: "Police Officer",
            personalityPrompt: "You are Officer Gao, a serious but helpful police officer at a busy railway station. You follow protocol and need precise information. You speak in a formal, authoritative tone. You will ask for specific descriptions (color, size, contents) and timings.",
        }
    });

    console.log("Creating Lost Bag Scenario...");
    await prisma.scenario.create({
        data: {
            title: "Emergency at the Station",
            description: "You've lost your backpack at the crowded Beijing Railway Station. Your passport might be inside. You find an officer to report the loss.",
            objective: "Report your lost bag (diū le bāobāo) to Officer Gao, describe it in detail (color, contents), and tell him where you last saw it.",
            difficulty: "Advanced",
            location: "Railway Station",
            characterId: officerGao.id,
            keyPhrases: [
                { phrase: "我丢了包包", pinyin: "Wǒ diūle bāobāo", translation: "I lost my bag" },
                { phrase: "里面有护照", pinyin: "Lǐmiàn yǒu hùzhào", translation: "Inside has my passport" },
                { phrase: "黑色的", pinyin: "Hēisè de", translation: "Black color" },
                { phrase: "我最后在...看见它", pinyin: "Wǒ zuìhòu zài... kànjiàn tā", translation: "I last saw it at..." }
            ]
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