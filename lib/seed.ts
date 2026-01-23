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
        zhang: await prisma.character.create({ data: { name: "Driver Zhang", role: "Taxi Driver", personalityPrompt: "Friendly but impatient Shanghai taxi driver. He talks about local traffic and expects the user to know their destination. If the user is slow, he might mutter about being in a hurry." } }),
        auntie: await prisma.character.create({ data: { name: "Auntie Wang", role: "Food Vendor", personalityPrompt: "Loud, enthusiastic dumpling stall owner. She uses local Shanghai-flavored Mandarin and is very pushy about upselling extra toppings. She loves it when students talk to her." } }),
        mei: await prisma.character.create({ data: { name: "Mei", role: "Boba Clerk", personalityPrompt: "Trendy, high-energy bubble tea clerk. She speaks quickly, uses modern slang, and is very pushy about upselling toppings like pearls or cheese foam." } }),
        li: await prisma.character.create({ data: { name: "Li Jie", role: "Store Clerk", personalityPrompt: "Busy but helpful grocery clerk. Professional and concise." } }),
        chen: await prisma.character.create({ data: { name: "Mr. Chen", role: "Local", personalityPrompt: "Kind elderly man who knows the area. He speaks slowly and loves sharing local lore and advice." } }),
        xiao: await prisma.character.create({ data: { name: "Xiao Ming", role: "Friend", personalityPrompt: "Casual, flexible friend who uses lots of slang and emojis in conversation." } }),
        manager: await prisma.character.create({ data: { name: "Manager Lin", role: "Receptionist", personalityPrompt: "Formal, polite hotel manager who takes pride in service and uses honorifics." } }),
        lao: await prisma.character.create({ data: { name: "Lao Li", role: "Vendor", personalityPrompt: "Crafty souvenir vendor who loves to bargain and will start with high prices." } }),
        teacher: await prisma.character.create({ data: { name: "Teacher Zhang", role: "Professor", personalityPrompt: "Patient but firm Chinese language teacher who will correct your grammar if it's too messy." } }),
        student: await prisma.character.create({ data: { name: "Wei Wei", role: "Classmate", personalityPrompt: "Friendly and helpful international student who is also learning Mandarin." } }),
        relative: await prisma.character.create({ data: { name: "Uncle Wong", role: "Elder Relative", personalityPrompt: "Traditional, warm-hearted uncle who loves asking about your job and relationship status." } }),
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
        }),
        tutorial: await prisma.pathway.create({
            data: {
                title: "Tutorial",
                description: "Learn how to use the app with Teacher Zhang.",
                icon: "GraduationCap",
                order: 0
            }
        })
    };

    console.log("Pathways created.");

    // --- PATHWAY 0: TUTORIAL ---
    const welcome = await prisma.scenario.create({
        data: {
            id: "tutorial-welcome",
            title: "Welcome to Shanghai",
            description: "A quick guide to start your journey.",
            objective: "Initiate conversation with Teacher Zhang by saying 'nǐ hǎo' (Hello). Learn how to check objectives, listen to audio, see pinyin, and save flashcards.",
            difficulty: "Beginner",
            location: "Shanghai Airport",
            characterId: c.teacher.id,
            pathwayId: p.tutorial.id,
            x: 50, y: 50,
            keyPhrases: [
                { phrase: "你好", pinyin: "nǐ hǎo", translation: "hello" },
                { phrase: "谢谢", pinyin: "xièxiè", translation: "thank you" },
                { phrase: "再见", pinyin: "zàijiàn", translation: "goodbye" },
                { phrase: "上海", pinyin: "Shànghǎi", translation: "Shanghai" }
            ]
        }
    });

    // --- PATHWAY 1: A DAY IN THE LIFE ---
    const breakfast = await prisma.scenario.create({
        data: {
            title: "Morning Jīnbǐng",
            description: "Buy breakfast from a street stall.",
            objective: "Order a savory pancake (Jianbing) with cilantro and extra chili. Specifically ask for NO onions and check if you can pay with WeChat Pay.",
            difficulty: "Beginner",
            location: "Street Corner",
            characterId: c.auntie.id,
            pathwayId: p.life.id,
            x: 50, y: 15,
            keyPhrases: [
                { phrase: "煎饼", pinyin: "jiānbǐng", translation: "savory pancake" },
                { phrase: "香菜", pinyin: "xiāngcài", translation: "cilantro" },
                { phrase: "加辣", pinyin: "jiā là", translation: "add chili/spicy" },
                { phrase: "不要洋葱", pinyin: "búyào yángcōng", translation: "no onions" },
                { phrase: "微信支付", pinyin: "wēixìn zhīfù", translation: "WeChat Pay" }
            ]
        }
    });

    const exercise = await prisma.scenario.create({
        data: {
            title: "Park Exercise",
            description: "Join locals for morning exercises.",
            objective: "Approach Mr. Chen in the park. Politey ask to join the Tai Chi group for a morning session and specifically ask what the 'Bird's Tail' movement is called in Chinese.",
            difficulty: "Beginner",
            location: "Public Park",
            characterId: c.chen.id,
            pathwayId: p.life.id,
            x: 20, y: 45,
            keyPhrases: [
                { phrase: "太极拳", pinyin: "tàijíquán", translation: "Tai Chi" },
                { phrase: "跟你们一起", pinyin: "gēn nǐmen yīqǐ", translation: "with you all" },
                { phrase: "招式", pinyin: "zhāoshì", translation: "movements/forms" },
                { phrase: "揽雀尾", pinyin: "lǎn què wěi", translation: "Grasp the Bird's Tail" }
            ],
            prerequisites: { connect: [{ id: breakfast.id }] }
        }
    });

    const commute = await prisma.scenario.create({
        data: {
            title: "Dìdidǎchē",
            description: "Call a ride-share to your office.",
            objective: "Confirm your destination at the Century Park entrance. Ask the driver to avoid the elevated highway if there's a traffic jam and ask for an estimated arrival time.",
            difficulty: "Beginner",
            location: "Sidewalk",
            characterId: c.zhang.id,
            pathwayId: p.life.id,
            x: 50, y: 75,
            keyPhrases: [
                { phrase: "目的地", pinyin: "mùdìdì", translation: "destination" },
                { phrase: "堵车", pinyin: "dǔchē", translation: "traffic jam" },
                { phrase: "师傅", pinyin: "shīfu", translation: "master/driver (polite)" },
                { phrase: "高架桥", pinyin: "gāojiàqiáo", translation: "elevated highway" },
                { phrase: "大概几点到", pinyin: "dàgài jǐdiǎn dào", translation: "roughly what time arrive" }
            ],
            prerequisites: { connect: [{ id: breakfast.id }] }
        }
    });

    const repair = await prisma.scenario.create({
        data: {
            title: "Phone Repair",
            description: "Your screen is cracked.",
            objective: "Explain to the technician that your screen is flickering and touch isn't working. Ask how much it costs to fix and if it can be ready in under 2 hours.",
            difficulty: "Advanced",
            location: "Repair Stall",
            characterId: c.zhang.id,
            pathwayId: p.life.id,
            x: 80, y: 105,
            keyPhrases: [
                { phrase: "屏幕", pinyin: "píngmù", translation: "screen" },
                { phrase: "坏了", pinyin: "huài le", translation: "broken" },
                { phrase: "修理", pinyin: "xiūlǐ", translation: "to repair" },
                { phrase: "闪烁", pinyin: "shǎnshuò", translation: "flicker" },
                { phrase: "触摸没反应", pinyin: "chùmō méi fǎnyìng", translation: "touch no response" },
                { phrase: "两小时以内", pinyin: "liǎng xiǎoshí yǐnèi", translation: "within two hours" }
            ],
            prerequisites: { connect: [{ id: commute.id }] }
        }
    });

    const coffee = await prisma.scenario.create({
        data: {
            title: "The Coffee Run",
            description: "Get your caffeine fix before the big meeting.",
            objective: "Order a large iced latte with oat milk, less ice, and no sugar. Ask for a cup sleeve because it's too cold to hold.",
            difficulty: "Beginner",
            location: "Cafe",
            characterId: c.mei.id,
            pathwayId: p.life.id,
            x: 20, y: 135,
            keyPhrases: [
                { phrase: "冰拿铁", pinyin: "bīng nátuǐ", translation: "iced latte" },
                { phrase: "燕麦奶", pinyin: "yànmàinǎi", translation: "oat milk" },
                { phrase: "打包", pinyin: "dǎbāo", translation: "to go / take out" },
                { phrase: "少冰", pinyin: "shǎo bīng", translation: "less ice" },
                { phrase: "无糖", pinyin: "wú táng", translation: "no sugar" },
                { phrase: "杯套", pinyin: "bēitào", translation: "cup sleeve" }
            ],
            prerequisites: { connect: [{ id: commute.id }] }
        }
    });

    const postOffice = await prisma.scenario.create({
        data: {
            title: "Sending a Package",
            description: "Ship a souvenir back home.",
            objective: "Tell Manager Lin you want to ship a fragile package to the US via air mail. Ask for the price per kilogram and when it's expected to arrive.",
            difficulty: "Intermediate",
            location: "Post Office",
            characterId: c.manager.id,
            pathwayId: p.life.id,
            x: 50, y: 165,
            keyPhrases: [
                { phrase: "寄包裹", pinyin: "jì bāoguǒ", translation: "ship a package" },
                { phrase: "易碎品", pinyin: "yìsuìpǐn", translation: "fragile item" },
                { phrase: "航空件", pinyin: "hángkōngjiàn", translation: "air mail" },
                { phrase: "每斤多少钱", pinyin: "měi jīn duōshǎo qián", translation: "how much per jin/kg" },
                { phrase: "预计达时间", pinyin: "yùjì dào shíjiān", translation: "expected arrival time" }
            ],
            prerequisites: { connect: [{ id: commute.id }] }
        }
    });

    const bookstore = await prisma.scenario.create({
        data: {
            title: "Hidden Gems",
            description: "Look for a specific book on history.",
            objective: "Ask the clerk for recommendations on local lore.",
            difficulty: "Advanced",
            location: "Bookstore",
            characterId: c.teacher.id,
            pathwayId: p.life.id,
            x: 20, y: 195,
            prerequisites: { connect: [{ id: exercise.id }] }
        }
    });

    const bank = await prisma.scenario.create({
        data: {
            title: "Opening an Account",
            description: "Set up a local bank account.",
            objective: "Inquire about the necessary documents.",
            difficulty: "Advanced",
            location: "Bank",
            characterId: c.manager.id,
            pathwayId: p.life.id,
            x: 80, y: 195,
            prerequisites: { connect: [{ id: postOffice.id }] }
        }
    });

    const pharmacy = await prisma.scenario.create({
        data: {
            title: "At the Pharmacy",
            description: "You have a slight headache.",
            objective: "Explain to Li Jie that you have a headache and a sore throat. Ask for a recommendation for traditional liquid medicine and specifically ask if it will make you drowsy.",
            difficulty: "Intermediate",
            location: "Pharmacy",
            characterId: c.li.id,
            pathwayId: p.life.id,
            x: 50, y: 225,
            keyPhrases: [
                { phrase: "头疼", pinyin: "tóuténg", translation: "headache" },
                { phrase: "嗓子痛", pinyin: "sǎngzi tòng", translation: "sore throat" },
                { phrase: "中成药", pinyin: "zhōngchéngyào", translation: "traditional Chinese medicine" },
                { phrase: "副作用", pinyin: "fùzuòyòng", translation: "side effects" },
                { phrase: "犯困", pinyin: "fànkùn", translation: "to feel sleepy" }
            ],
            prerequisites: { connect: [{ id: coffee.id }, { id: postOffice.id }] }
        }
    });

    const laundry = await prisma.scenario.create({
        data: {
            title: "Dry Cleaning",
            description: "Drop off your suit for cleaning.",
            objective: "Ask when it will be ready and for a receipt.",
            difficulty: "Intermediate",
            location: "Laundry Shop",
            characterId: c.li.id,
            pathwayId: p.life.id,
            x: 20, y: 255,
            prerequisites: { connect: [{ id: pharmacy.id }] }
        }
    });

    const haircut = await prisma.scenario.create({
        data: {
            title: "New Look",
            description: "Get a haircut in a trendy salon.",
            objective: "Explain that you want a trim and show a photo.",
            difficulty: "Intermediate",
            location: "Hair Salon",
            characterId: c.mei.id,
            pathwayId: p.life.id,
            x: 80, y: 255,
            prerequisites: { connect: [{ id: pharmacy.id }] }
        }
    });

    const dinner = await prisma.scenario.create({
        data: {
            title: "Hot Pot Dinner",
            description: "Meet Xiao Ming for dinner.",
            objective: "Meet Xiao Ming at the restaurant. Suggest ordering a 'Half-and-Half' pot with spicy and clear broth. Ask for recommendations on his favorite dipping sauce ingredients.",
            difficulty: "Intermediate",
            location: "Hot Pot Restaurant",
            characterId: c.xiao.id,
            pathwayId: p.life.id,
            x: 50, y: 285,
            keyPhrases: [
                { phrase: "鸳鸯锅", pinyin: "yuānyāng guō", translation: "Half-and-Half pot" },
                { phrase: "清汤", pinyin: "qīngtāng", translation: "clear broth" },
                { phrase: "麻辣", pinyin: "málà", translation: "numbing and spicy" },
                { phrase: "蘸料", pinyin: "zhànliào", translation: "dipping sauce" },
                { phrase: "调料台", pinyin: "tiáoliào tái", translation: "sauce station" }
            ],
            prerequisites: { connect: [{ id: laundry.id }, { id: haircut.id }] }
        }
    });

    const karaoke = await prisma.scenario.create({
        data: {
            title: "KTV Night",
            description: "Go to karaoke with friends.",
            objective: "Suggest some songs to sing and order snacks.",
            difficulty: "Advanced",
            location: "KTV Room",
            characterId: c.xiao.id,
            pathwayId: p.life.id,
            x: 20, y: 315,
            prerequisites: { connect: [{ id: dinner.id }] }
        }
    });

    const nightWalk = await prisma.scenario.create({
        data: {
            title: "Bund Stroll",
            description: "Take a walk along the river.",
            objective: "Comment on the beautiful skyline views.",
            difficulty: "Advanced",
            location: "The Bund",
            characterId: c.chen.id,
            pathwayId: p.life.id,
            x: 80, y: 315,
            prerequisites: { connect: [{ id: dinner.id }] }
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
            x: 50, y: 345,
            prerequisites: { connect: [{ id: karaoke.id }, { id: nightWalk.id }] }
        }
    });

    // --- PATHWAY 2: A SCHOOL DAY ---
    const registration = await prisma.scenario.create({
        data: {
            title: "Student Reg",
            description: "Register for your new semester.",
            objective: "Confirm your major as 'International Business' and get your ID card. Ask Manager Lin where the main student canteen is located.",
            difficulty: "Beginner",
            location: "Admin Building",
            characterId: c.manager.id,
            pathwayId: p.school.id,
            x: 50, y: 15,
            keyPhrases: [
                { phrase: "报到", pinyin: "bàodào", translation: "to register/report" },
                { phrase: "专业", pinyin: "zhuānyè", translation: "major" },
                { phrase: "国际商务", pinyin: "guójì shāngwù", translation: "International Business" },
                { phrase: "学生证", pinyin: "xuéshengzhèng", translation: "student ID" },
                { phrase: "食堂", pinyin: "shítáng", translation: "canteen" }
            ]
        }
    });

    const dorm = await prisma.scenario.create({
        data: {
            title: "Dorm Check-in",
            description: "Get your room keys and meeting rules.",
            objective: "Ask about the laundry room location and if there's a curfew. Specifically ask if you can bring a small electric kettle into the room.",
            difficulty: "Beginner",
            location: "Dormitory",
            characterId: c.manager.id,
            pathwayId: p.school.id,
            x: 80, y: 45,
            keyPhrases: [
                { phrase: "宿舍", pinyin: "sùshè", translation: "dormitory" },
                { phrase: "洗衣房", pinyin: "xǐyīfáng", translation: "laundry room" },
                { phrase: "门禁", pinyin: "ménjìn", translation: "curfew" },
                { phrase: "电水壶", pinyin: "diànshuǐhú", translation: "electric kettle" },
                { phrase: "宿管", pinyin: "sùguǎn", translation: "dorm manager" }
            ],
            prerequisites: { connect: [{ id: registration.id }] }
        }
    });

    const classFinding = await prisma.scenario.create({
        data: {
            title: "Finding Class",
            description: "You're late for your first lecture.",
            objective: "Ask Wei Wei for directions to Room 302. Explain that you're a new student and seem a bit lost.",
            difficulty: "Beginner",
            location: "Campus Hallway",
            characterId: c.student.id,
            pathwayId: p.school.id,
            x: 50, y: 75,
            keyPhrases: [
                { phrase: "教学楼", pinyin: "jiàoxuélóu", translation: "teaching building" },
                { phrase: "请问...怎么走", pinyin: "qǐngwèn... zěnme zǒu", translation: "excuse me, how to get to..." },
                { phrase: "迷路了", pinyin: "mílù le", translation: "to be lost" },
                { phrase: "新生", pinyin: "xīnshēng", translation: "new student" },
                { phrase: "找教室", pinyin: "zhǎo jiàoshì", translation: "find classroom" }
            ],
            prerequisites: { connect: [{ id: registration.id }] }
        }
    });

    const cafeteria = await prisma.scenario.create({
        data: {
            title: "Canteen Lunch",
            description: "Navigate the busy student cafeteria.",
            objective: "Order a local specialty and find a seat.",
            difficulty: "Beginner",
            location: "Canteen",
            characterId: c.student.id,
            pathwayId: p.school.id,
            x: 20, y: 110,
            prerequisites: { connect: [{ id: classFinding.id }] }
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
            x: 80, y: 110,
            prerequisites: { connect: [{ id: classFinding.id }] }
        }
    });

    const printing = await prisma.scenario.create({
        data: {
            title: "Printing Shop",
            description: "Print your essay for tomorrow.",
            objective: "Ask for double-sided printing and staples.",
            difficulty: "Intermediate",
            location: "Campus Shop",
            characterId: c.li.id,
            pathwayId: p.school.id,
            x: 50, y: 145,
            prerequisites: { connect: [{ id: cafeteria.id }, { id: library.id }] }
        }
    });

    const lab = await prisma.scenario.create({
        data: {
            title: "Lab Safety",
            description: "First day in the chemistry lab.",
            objective: "Ask the professor about safety protocols.",
            difficulty: "Advanced",
            location: "Science Lab",
            characterId: c.teacher.id,
            pathwayId: p.school.id,
            x: 20, y: 180,
            prerequisites: { connect: [{ id: printing.id }] }
        }
    });

    const club = await prisma.scenario.create({
        data: {
            title: "Join the Club",
            description: "Inquire about the Wushu club.",
            objective: "Ask about the meeting times and requirements.",
            difficulty: "Intermediate",
            location: "Gymnasium",
            characterId: c.teacher.id,
            pathwayId: p.school.id,
            x: 80, y: 180,
            prerequisites: { connect: [{ id: printing.id }] }
        }
    });

    const peerReview = await prisma.scenario.create({
        data: {
            title: "Peer Review",
            description: "Exchange drafts with a classmate.",
            objective: "Give constructive feedback on their essay.",
            difficulty: "Advanced",
            location: "Classroom",
            characterId: c.student.id,
            pathwayId: p.school.id,
            x: 50, y: 215,
            prerequisites: { connect: [{ id: lab.id }, { id: club.id }] }
        }
    });

    const exchange = await prisma.scenario.create({
        data: {
            title: "Language Exchange",
            description: "Meet a local for language practice.",
            objective: "Suggest topics and coordinate future meetings.",
            difficulty: "Advanced",
            location: "Campus Cafe",
            characterId: c.student.id,
            pathwayId: p.school.id,
            x: 20, y: 250,
            prerequisites: { connect: [{ id: peerReview.id }] }
        }
    });

    const sports = await prisma.scenario.create({
        data: {
            title: "Sports Meet",
            description: "Participate in the campus games.",
            objective: "Cheer for your team and ask for the score.",
            difficulty: "Intermediate",
            location: "Track Field",
            characterId: c.student.id,
            pathwayId: p.school.id,
            x: 80, y: 250,
            prerequisites: { connect: [{ id: peerReview.id }] }
        }
    });

    const tour = await prisma.scenario.create({
        data: {
            title: "Campus History",
            description: "Listen to a talk on the old gate.",
            objective: "Ask a question about the university's origins.",
            difficulty: "Advanced",
            location: "Main Gate",
            characterId: c.chen.id,
            pathwayId: p.school.id,
            x: 50, y: 285,
            prerequisites: { connect: [{ id: exchange.id }, { id: sports.id }] }
        }
    });

    const itSupport = await prisma.scenario.create({
        data: {
            title: "IT Support",
            description: "WiFi is not working in the dorm.",
            objective: "Describe the issue and ask for a fix.",
            difficulty: "Intermediate",
            location: "IT Office",
            characterId: c.manager.id,
            pathwayId: p.school.id,
            x: 80, y: 315,
            prerequisites: { connect: [{ id: tour.id }] }
        }
    });

    const graduation = await prisma.scenario.create({
        data: {
            title: "Graduation Prep",
            description: "Pick up your cap and gown.",
            objective: "Check if the size is correct and ask about the ceremony.",
            difficulty: "Advanced",
            location: "Auditorium",
            characterId: c.manager.id,
            pathwayId: p.school.id,
            x: 50, y: 345,
            prerequisites: { connect: [{ id: tour.id }] }
        }
    });

    const finalPresentation = await prisma.scenario.create({
        data: {
            title: "The Final Defense",
            description: "Present your thesis to the panel.",
            objective: "Summarize your findings and answer questions.",
            difficulty: "Advanced",
            location: "Meeting Hall",
            characterId: c.teacher.id,
            pathwayId: p.school.id,
            x: 50, y: 385,
            prerequisites: { connect: [{ id: graduation.id }] }
        }
    });

    // --- PATHWAY 3: CHINESE NEW YEAR ---
    const preparations = await prisma.scenario.create({
        data: {
            title: "Feast Prep",
            description: "Buy decorations and food with Uncle Wong.",
            objective: "Buy red lanterns and fish with Uncle Wong. Specifically ask the vendor for 'thick' lanterns and a 'fat' fish for good luck.",
            difficulty: "Beginner",
            location: "Shopping Street",
            characterId: c.relative.id,
            pathwayId: p.cny.id,
            x: 50, y: 15,
            keyPhrases: [
                { phrase: "红灯笼", pinyin: "hóng dēnglóng", translation: "red lanterns" },
                { phrase: "厚实", pinyin: "hòushi", translation: "thick/sturdy" },
                { phrase: "肥鱼", pinyin: "féiyú", translation: "fat fish" },
                { phrase: "挑选", pinyin: "tiāoxuǎn", translation: "to pick/choose" },
                { phrase: "年货", pinyin: "niánhuò", translation: "New Year goods" }
            ]
        }
    });

    const buyingFish = await prisma.scenario.create({
        data: {
            title: "Nian Nian You Yu",
            description: "Buy the symbolic fish for dinner.",
            objective: "Ask Auntie Wang for a fresh perch and express its meaning for the New Year. See if you can get a discount if you buy two.",
            difficulty: "Beginner",
            location: "Fish Market",
            characterId: c.auntie.id,
            pathwayId: p.cny.id,
            x: 20, y: 50,
            keyPhrases: [
                { phrase: "鲜鱼", pinyin: "xiānyú", translation: "fresh fish" },
                { phrase: "鲈鱼", pinyin: "lúyú", translation: "perch" },
                { phrase: "年年有余", pinyin: "niánnián yǒuyú", translation: "abundance every year" },
                { phrase: "便宜一点", pinyin: "piányi yīdiǎn", translation: "a bit cheaper" },
                { phrase: "新鲜", pinyin: "xīnxiān", translation: "fresh" }
            ],
            prerequisites: { connect: [{ id: preparations.id }] }
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
            x: 50, y: 85,
            prerequisites: { connect: [{ id: preparations.id }] }
        }
    });

    const dumplings = await prisma.scenario.create({
        data: {
            title: "Dumpling Joy",
            description: "Learn to fold dumplings.",
            objective: "Ask Uncle Wong about the filling ingredients. Propose a competition to see who can wrap the most 'lucky' dumplings with a coin inside.",
            difficulty: "Beginner",
            location: "Kitchen",
            characterId: c.relative.id,
            pathwayId: p.cny.id,
            x: 80, y: 120,
            keyPhrases: [
                { phrase: "馅儿", pinyin: "xiànr", translation: "filling" },
                { phrase: "包饺子", pinyin: "bāo jiǎozi", translation: "wrap dumplings" },
                { phrase: "硬币", pinyin: "yìngbì", translation: "coin" },
                { phrase: "运气", pinyin: "yùnqi", translation: "luck" },
                { phrase: "比一比", pinyin: "bǐ yī bǐ", translation: "to compete/compare" }
            ],
            prerequisites: { connect: [{ id: greetings.id }] }
        }
    });

    const firecrackers = await prisma.scenario.create({
        data: {
            title: "Light the Night",
            description: "Handle firecrackers carefully.",
            objective: "Ask how to light them safely and duck for cover.",
            difficulty: "Intermediate",
            location: "Village Square",
            characterId: c.xiao.id,
            pathwayId: p.cny.id,
            x: 20, y: 120,
            prerequisites: { connect: [{ id: greetings.id }] }
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
            x: 50, y: 155,
            prerequisites: { connect: [{ id: firecrackers.id }] }
        }
    });

    const lionDance = await prisma.scenario.create({
        data: {
            title: "Lion Dance",
            description: "Watch the performers in the street.",
            objective: "Ask about the history of the dance.",
            difficulty: "Intermediate",
            location: "Main Street",
            characterId: c.lao.id,
            pathwayId: p.cny.id,
            x: 80, y: 190,
            prerequisites: { connect: [{ id: templeFair.id }] }
        }
    });

    const giftExchange = await prisma.scenario.create({
        data: {
            title: "Gift Exchange",
            description: "Bring fruit baskets to neighbors.",
            objective: "Politely insist they accept the gift.",
            difficulty: "Intermediate",
            location: "Neighbor's Door",
            characterId: c.relative.id,
            pathwayId: p.cny.id,
            x: 50, y: 225,
            prerequisites: { connect: [{ id: lionDance.id }] }
        }
    });

    const teaCeremony = await prisma.scenario.create({
        data: {
            title: "Afternoon Tea",
            description: "Learn the proper way to serve tea.",
            objective: "Demonstrate respect and ask about tea types.",
            difficulty: "Advanced",
            location: "Tea House",
            characterId: c.chen.id,
            pathwayId: p.cny.id,
            x: 20, y: 260,
            prerequisites: { connect: [{ id: giftExchange.id }] }
        }
    });

    const riddles = await prisma.scenario.create({
        data: {
            title: "Lantern Riddles",
            description: "Solve puzzles written on lanterns.",
            objective: "Try to guess a riddle and ask for a hint.",
            difficulty: "Advanced",
            location: "Garden",
            characterId: c.teacher.id,
            pathwayId: p.cny.id,
            x: 80, y: 260,
            prerequisites: { connect: [{ id: giftExchange.id }] }
        }
    });

    const lanternFestival = await prisma.scenario.create({
        data: {
            title: "Lantern Glow",
            description: "The final celebration of the season.",
            objective: "Discuss the different lantern designs.",
            difficulty: "Advanced",
            location: "Riverside",
            characterId: c.mei.id,
            pathwayId: p.cny.id,
            x: 50, y: 295,
            prerequisites: { connect: [{ id: teaCeremony.id }, { id: riddles.id }] }
        }
    });

    const reunionDinner = await prisma.scenario.create({
        data: {
            title: "Reunion Feast",
            description: "The main family dinner.",
            objective: "Give a small toast to the elder relatives.",
            difficulty: "Advanced",
            location: "Dining Room",
            characterId: c.relative.id,
            pathwayId: p.cny.id,
            x: 20, y: 335,
            prerequisites: { connect: [{ id: lanternFestival.id }] }
        }
    });

    const springCouplets = await prisma.scenario.create({
        data: {
            title: "Spring Couplets",
            description: "Write poetry for the front door.",
            objective: "Choose auspicious characters with Mr. Chen.",
            difficulty: "Advanced",
            location: "Study Room",
            characterId: c.chen.id,
            pathwayId: p.cny.id,
            x: 80, y: 335,
            prerequisites: { connect: [{ id: lanternFestival.id }] }
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