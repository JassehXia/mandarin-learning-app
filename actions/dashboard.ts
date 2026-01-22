"use server";

import { prisma as db } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth-util";
import { startOfDay, endOfDay } from "date-fns";

export async function getDashboardStats() {
    const user = await getOrCreateUser();
    if (!user) return null;

    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // 1. Scenarios completed today
    const completedToday = await db.conversation.count({
        where: {
            userId: user.id,
            status: "COMPLETED",
            updatedAt: {
                gte: start,
                lte: end
            }
        }
    });

    // 2. Flashcards added today
    const flashcardsToday = await db.flashcard.count({
        where: {
            userId: user.id,
            createdAt: {
                gte: start,
                lte: end
            }
        }
    });

    // 3. Average score today
    const conversationsToday = await db.conversation.findMany({
        where: {
            userId: user.id,
            updatedAt: {
                gte: start,
                lte: end
            },
            score: { not: null }
        },
        select: { score: true, corrections: true }
    });

    const avgScore = conversationsToday.length > 0
        ? Math.round(conversationsToday.reduce((acc, c) => acc + (c.score || 0), 0) / conversationsToday.length)
        : 0;

    // 4. Mistake Categorization (Aggragated from today's corrections)
    const mistakeCounts: Record<string, number> = {
        "Grammar": 0,
        "Word Choice": 0,
        "Spelling": 0,
        "Other": 0
    };

    conversationsToday.forEach(c => {
        const corrections = (c as any).corrections as any[] | null;
        if (corrections && Array.isArray(corrections)) {
            corrections.forEach(corr => {
                const cat = corr.category || "Other";
                if (mistakeCounts[cat] !== undefined) {
                    mistakeCounts[cat]++;
                } else {
                    mistakeCounts["Other"]++;
                }
            });
        }
    });

    // 5. Recent activity (last 5 interactions)
    const recentActivity = await db.conversation.findMany({
        where: { userId: user.id },
        include: { scenario: true },
        orderBy: { updatedAt: 'desc' },
        take: 5
    });

    // 5. Total counts (for context)
    const totalFlashcards = await db.flashcard.count({ where: { userId: user.id } });
    const totalCompleted = user.completedScenarioIds.length;

    return {
        daily: {
            completed: completedToday,
            flashcards: flashcardsToday,
            avgScore: avgScore,
            goalPercent: Math.min(Math.round((completedToday / 3) * 100), 100),
            mistakes: mistakeCounts
        },
        total: {
            flashcards: totalFlashcards,
            completed: totalCompleted
        },
        recentActivity: recentActivity.map(a => ({
            id: a.id,
            scenarioTitle: a.scenario.title,
            status: a.status,
            score: a.score,
            date: a.updatedAt.toISOString()
        }))
    };
}
