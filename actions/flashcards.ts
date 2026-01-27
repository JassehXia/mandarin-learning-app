"use server";

import { prisma as db } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth-util";
import { revalidatePath } from "next/cache";

export async function saveFlashcard(data: {
    hanzi: string;
    pinyin: string;
    meaning: string;
    explanation?: string;
    folderId?: string;
}) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    const flashcard = await db.flashcard.create({
        data: {
            ...data,
            userId: user.id,
            folderId: data.folderId
        }
    });

    revalidatePath("/flashcards");
    return flashcard;
}

export async function saveFlashcardsBatch(flashcards: {
    hanzi: string;
    pinyin: string;
    meaning: string;
    explanation?: string;
    folderId?: string;
}[]) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    const created = await db.flashcard.createMany({
        data: flashcards.map(f => ({
            ...f,
            userId: user.id,
            folderId: f.folderId
        }))
    });

    revalidatePath("/flashcards");
    return created;
}

export async function getUserFlashcards(folderId?: string) {
    const user = await getOrCreateUser();
    if (!user) return [];

    const flashcards = await db.flashcard.findMany({
        where: {
            userId: user.id,
            ...(folderId ? { folderId } : {})
        },
        orderBy: { createdAt: 'desc' }
    });

    return flashcards;
}

export async function deleteFlashcard(id: string) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    await db.flashcard.delete({
        where: {
            id,
            userId: user.id
        }
    });

    revalidatePath("/flashcards");
    revalidatePath("/review");
}

export async function translateSelection(text: string) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    const { translateSelection: aiTranslate } = await import("@/lib/ai");
    return aiTranslate(text);
}

// Folder Actions
export async function createFolder(name: string) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    const folder = await db.flashcardFolder.create({
        data: {
            name,
            userId: user.id
        }
    });

    revalidatePath("/flashcards");
    return folder;
}

export async function getFolders() {
    const user = await getOrCreateUser();
    if (!user) return [];

    return db.flashcardFolder.findMany({
        where: { userId: user.id },
        include: { _count: { select: { flashcards: true } } },
        orderBy: { createdAt: 'desc' }
    });
}

export async function deleteFolder(id: string) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    // We might want to just unassign the flashcards or delete them.
    // Let's just unassign them for safety (Prisma will do this if not specified, 
    // but Flashcard has folderId as optional so it works).
    await db.flashcardFolder.delete({
        where: { id, userId: user.id }
    });

    revalidatePath("/flashcards");
}

export async function moveFlashcardToFolder(flashcardId: string, folderId: string | null) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    await db.flashcard.update({
        where: { id: flashcardId, userId: user.id },
        data: { folderId }
    });

    revalidatePath("/flashcards");
}

