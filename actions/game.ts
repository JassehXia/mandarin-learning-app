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
    let suggestedFlashcards: { hanzi: string; pinyin: string; meaning: string; explanation: string }[] = [];

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

        feedback = coachReport.feedback;
        score = coachReport.score;
        corrections = enrichedCorrections;
        suggestedFlashcards = coachReport.suggestedFlashcards;

        if (aiResponse.status === "COMPLETED" && conversation.userId) {
            // Persist progress to User model
            const user = await db.user.findUnique({
                where: { id: conversation.userId },
                select: { completedScenarioIds: true }
            });

            if (user && !user.completedScenarioIds.includes(scenario.id)) {
                await db.user.update({
                    where: { id: conversation.userId },
                    data: {
                        completedScenarioIds: {
                            push: scenario.id
                        }
                    }
                });
            }

            // DELETE messages and conversation to save storage (as requested)
            // Note: We've already gathered the feedback so we can return it to the UI
            await db.message.deleteMany({ where: { conversationId } });
            await db.conversation.delete({ where: { id: conversationId } });
        } else {
            // For FAILED or if no userId, we can keep it or delete it. 
            // Usually, we'd only persist mastery on COMPLETED.
            // Let's at least update the status if we don't delete.
            await db.conversation.update({
                where: { id: conversation.id },
                data: {
                    status: aiResponse.status,
                    feedback: coachReport.feedback,
                    score: coachReport.score,
                    corrections: enrichedCorrections as any,
                    suggestedFlashcards: coachReport.suggestedFlashcards as any
                }
            });
        }
    }

    revalidatePath(`/play/${scenario.id}`);
    revalidatePath(`/stages`);

    return {
        message: newMessage,
        status: finalStatus,
        feedback,
        score,
        corrections,
        suggestedFlashcards
    };
}

export async function restartGame(conversationId: string, scenarioId: string) {
    // Check if conversation still exists before trying to delete
    const exists = await db.conversation.findUnique({ where: { id: conversationId } });
    if (exists) {
        await db.message.deleteMany({ where: { conversationId } });
        await db.conversation.delete({ where: { id: conversationId } });
    }
    revalidatePath(`/play/${scenarioId}`);
}

export async function deleteConversation(conversationId: string) {
    const exists = await db.conversation.findUnique({ where: { id: conversationId } });
    if (exists) {
        await db.conversation.delete({ where: { id: conversationId } });
    }
    revalidatePath("/");
}

