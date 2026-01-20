"use server";

import { prisma as db } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth-util";
import { revalidatePath } from "next/cache";

export async function saveFlashcard(data: {
    hanzi: string;
    pinyin: string;
    meaning: string;
    explanation?: string;
}) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    const flashcard = await db.flashcard.create({
        data: {
            ...data,
            userId: user.id
        }
    });

    return flashcard;
}

export async function saveFlashcardsBatch(flashcards: {
    hanzi: string;
    pinyin: string;
    meaning: string;
    explanation?: string;
}[]) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    const created = await db.flashcard.createMany({
        data: flashcards.map(f => ({
            ...f,
            userId: user.id
        }))
    });

    return created;
}
