import { NextRequest } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { chatWithCharacterStream, generateFeedback, summarizeHistory } from "@/lib/ai";
import { getOrCreateUser } from "@/lib/auth-util";
import { pinyin } from "pinyin-pro";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
    try {
        const { conversationId, content } = await req.json();

        // 1. Fetch Context
        const conversation = await db.conversation.findUnique({
            where: { id: conversationId },
            include: {
                scenario: { include: { character: true } },
                messages: { orderBy: { createdAt: 'asc' } }
            }
        });

        if (!conversation) return new Response("Conversation not found", { status: 404 });

        // 2. Save User Message
        await db.message.create({
            data: {
                conversationId,
                role: "user",
                content,
            }
        });

        const { scenario, messages } = conversation;
        const character = scenario.character;
        if (!character) return new Response("Character not found", { status: 404 });

        // 3. Prepare History for AI & Token Optimization
        let fullHistory = messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
        }));
        fullHistory.push({ role: 'user', content });

        let finalHistory = fullHistory;
        let summary = undefined;

        if (fullHistory.length > 6) {
            const messagesToSummarize = fullHistory.slice(0, -6);
            finalHistory = fullHistory.slice(-6);
            summary = await summarizeHistory(messagesToSummarize as any);
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                let fullAiResponse = "";

                try {
                    const aiStream = chatWithCharacterStream(
                        finalHistory as any,
                        character.personalityPrompt,
                        scenario.objective,
                        summary
                    );

                    for await (const chunk of aiStream) {
                        fullAiResponse += chunk;
                        controller.enqueue(encoder.encode(chunk));
                    }

                    // After stream ends, handle metadata and persistence
                    const parts = fullAiResponse.split("---METADATA---");
                    const mainContent = parts[0].trim();
                    let metadata = { translation: "", status: "ACTIVE" };

                    try {
                        if (parts[1]) {
                            metadata = JSON.parse(parts[1].trim());
                        }
                    } catch (e) {
                        console.error("Failed to parse metadata from stream", e);
                    }

                    const cleanedContent = mainContent.trim();
                    const responsePinyin = cleanedContent ? pinyin(cleanedContent) : "";

                    // Save AI Message to DB
                    await db.message.create({
                        data: {
                            conversationId,
                            role: "assistant",
                            content: mainContent,
                            pinyin: responsePinyin,
                            translation: metadata.translation
                        }
                    });

                    // Handle scenario completion/feedback
                    if (metadata.status !== "ACTIVE") {
                        const feedbackReport = await generateFeedback(
                            [...fullHistory, { role: 'assistant', content: mainContent }],
                            scenario.title,
                            scenario.objective
                        );

                        // Enrich corrections with pinyin-pro for accuracy
                        const enrichedCorrections = feedbackReport.corrections.map(c => {
                            const originalClean = c.original.trim();
                            const correctionClean = c.correction.trim();
                            return {
                                ...c,
                                originalPinyin: originalClean ? pinyin(originalClean) : "",
                                correctionPinyin: correctionClean ? pinyin(correctionClean) : ""
                            };
                        });

                        // Persist progress to User model
                        if (metadata.status === "COMPLETED" && conversation.userId) {
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

                            // Storage Opt: Delete messages on completion
                            await db.message.deleteMany({ where: { conversationId } });
                        }

                        await db.conversation.update({
                            where: { id: conversationId },
                            data: {
                                status: metadata.status as any,
                                feedback: feedbackReport.feedback,
                                score: feedbackReport.score,
                                corrections: enrichedCorrections as any,
                                suggestedFlashcards: feedbackReport.suggestedFlashcards as any
                            }
                        });

                        // Enrich metadata for the frontend
                        const enrichedMetadata = {
                            ...metadata,
                            score: feedbackReport.score,
                            feedback: feedbackReport.feedback,
                            corrections: enrichedCorrections,
                            suggestedFlashcards: feedbackReport.suggestedFlashcards
                        };

                        controller.enqueue(encoder.encode(`---REPORT---${JSON.stringify(enrichedMetadata)}`));

                        // Revalidate paths
                        revalidatePath(`/play/${scenario.id}`);
                        revalidatePath(`/stages`);
                    }
                } catch (error) {
                    console.error("Streaming error:", error);
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });

    } catch (error) {
        console.error("API Route Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
