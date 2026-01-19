"use server";

import { prisma as db } from "@/lib/prisma"; // Use the singleton
import { chatWithCharacter, generateFeedback } from "@/lib/ai";
import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/auth-util";
import { pinyin } from "pinyin-pro";

export async function startGame(scenarioId: string, userId?: string) {
    // 0. Resolve User
    const user = await getOrCreateUser();
    const effectiveUserId = user?.id || userId;

    // 1. Validate Scenario
    const scenario = await db.scenario.findUnique({
        where: { id: scenarioId },
        include: { character: true }
    });

    if (!scenario || !scenario.character) {
        throw new Error("Scenario not found");
    }

    // 2. Check for existing ACTIVE conversation
    const existingConversation = await db.conversation.findFirst({
        where: {
            scenarioId: scenario.id,
            status: "ACTIVE",
            userId: effectiveUserId
        },
        orderBy: { createdAt: 'desc' }
    });

    if (existingConversation) {
        return existingConversation;
    }

    // 3. Create Conversation
    const conversation = await db.conversation.create({
        data: {
            scenarioId: scenario.id,
            userId: effectiveUserId, // Link to real user if logged in
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

    // 4. Run AI
    const aiResponse = await chatWithCharacter(history, character.personalityPrompt, scenario.objective);

    // 5. Generate Pinyin Server-Side
    const responsePinyin = pinyin(aiResponse.content);

    // 6. Save AI Response
    const newMessage = await db.message.create({
        data: {
            conversationId,
            role: "assistant",
            content: aiResponse.content,
            pinyin: responsePinyin,
            translation: aiResponse.translation
        }
    });

    // 7. Update Status & Generate Feedback if ended
    let finalStatus = aiResponse.status;
    let feedback = null;
    let score = null;
    let corrections = null;

    if (aiResponse.status !== "ACTIVE") {
        // Conversation just ended, get coach feedback
        const coachReport = await generateFeedback(
            [...history, { role: 'assistant', content: aiResponse.content }],
            scenario.title,
            scenario.objective
        );

        // Enrich corrections with pinyin-pro for accuracy
        const enrichedCorrections = coachReport.corrections.map(c => ({
            ...c,
            originalPinyin: pinyin(c.original),
            correctionPinyin: pinyin(c.correction)
        }));

        await db.conversation.update({
            where: { id: conversation.id },
            data: {
                status: aiResponse.status,
                feedback: coachReport.feedback,
                score: coachReport.score,
                corrections: enrichedCorrections as any
            }
        });
        feedback = coachReport.feedback;
        score = coachReport.score;
        corrections = enrichedCorrections;
    }

    revalidatePath(`/play/${scenario.id}`);

    return {
        message: newMessage,
        status: finalStatus,
        feedback,
        score,
        corrections
    };
}

export async function restartGame(conversationId: string, scenarioId: string) {
    await db.message.deleteMany({ where: { conversationId } });
    await db.conversation.delete({ where: { id: conversationId } });
    revalidatePath(`/play/${scenarioId}`);
}

export async function deleteConversation(conversationId: string) {
    await db.conversation.delete({ where: { id: conversationId } });
    revalidatePath("/");
}

