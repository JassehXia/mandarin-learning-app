import { ChatInterface } from "@/components/game/ChatInterface";
import { startGame } from "@/actions/game";
import { PrismaClient, Prisma, Message } from "@/app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

// Ensure we have a db instance
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export default async function PlayPage({ params }: { params: { scenarioId: string } }) {
    // Await params for nextjs 15+ if needed, but for now access directly
    const { scenarioId } = await params;

    // Start (or retrieve) the game session
    // In a real app we might verify user session here
    let conversation;
    try {
        conversation = await startGame(scenarioId);
    } catch (e) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FDFBF7] text-[#C41E3A]">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Error Starting Game</h1>
                    <p>Could not load scenario: {scenarioId}</p>
                </div>
            </div>
        );
    }

    // Fetch full details for UI
    const fullConversation = await prisma.conversation.findUnique({
        where: { id: conversation.id },
        include: {
            scenario: {
                include: { character: true }
            },
            messages: true
        }
    });

    if (!fullConversation) return <div>Loading...</div>;

    return (
        <ChatInterface
            conversationId={fullConversation.id}
            initialMessages={fullConversation.messages.map((m: Message) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
                pinyin: m.pinyin || undefined,
                translation: m.translation || undefined
            }))}
            initialStatus={fullConversation.status}
            initialScore={fullConversation.score}
            initialFeedback={fullConversation.feedback}
            initialCorrections={fullConversation.corrections}
            initialSuggestedFlashcards={fullConversation.suggestedFlashcards}
            scenario={{
                id: fullConversation.scenario.id,
                title: fullConversation.scenario.title,
                objective: fullConversation.scenario.objective,
                location: fullConversation.scenario.location,
                keyPhrases: fullConversation.scenario.keyPhrases,
                character: {
                    name: fullConversation.scenario.character?.name || "Unknown",
                    role: fullConversation.scenario.character?.role || "Local",
                    avatarUrl: fullConversation.scenario.character?.avatarUrl || undefined
                }
            }}
        />
    );
}
