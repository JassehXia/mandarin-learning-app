"use server";

import { prisma as db } from "@/lib/prisma"; // Use the singleton
import { chatWithCharacter, evaluateObjective } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export async function startGame(scenarioId: string, userId?: string) {
    // 1. Validate Scenario
    const scenario = await db.scenario.findUnique({
        where: { id: scenarioId },
        include: { character: true }
    });

    if (!scenario || !scenario.character) {
        throw new Error("Scenario not found");
    }

    // 2. Create Conversation
    const conversation = await db.conversation.create({
        data: {
            scenarioId: scenario.id,
            userId: userId, // Optional for now
            status: "ACTIVE",
            // Initial AI greeting could go here if we wanted
        }
    });

    return conversation;
}

export async function submitMessage(conversationId: string, content: string) {
    // 1. Fetch Context
    const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        include: {
            scenario: { include: { character: true } },
            messages: { orderBy: { createdAt: 'asc' } }
        }
    });

    if (!conversation) throw new Error("Conversation not found");

    const { scenario, messages } = conversation;
    const character = scenario.character;
    if (!character) throw new Error("Character not found");

    // 2. Save User Message
    await db.message.create({
        data: {
            conversationId,
            role: "user",
            content,
        }
    });

    // 3. Prepare History for AI
    const history = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
    }));
    history.push({ role: 'user', content });

    // 4. Run AI (Parallel Execution)
    const [aiResponse, evaluation] = await Promise.all([
        chatWithCharacter(history, character.personalityPrompt),
        evaluateObjective(history, scenario.objective)
    ]);

    // 5. Save AI Response
    const newMessage = await db.message.create({
        data: {
            conversationId,
            role: "assistant",
            content: aiResponse.content,
            pinyin: aiResponse.pinyin,
            translation: aiResponse.translation
        }
    });

    // 6. Update Status if changed
    if (evaluation.status !== conversation.status && evaluation.status !== "ACTIVE") {
        await db.conversation.update({
            where: { id: conversation.id },
            data: { status: evaluation.status }
        });
    }

    revalidatePath(`/play/${scenario.id}`);

    return {
        message: newMessage,
        status: evaluation.status
    };
}
