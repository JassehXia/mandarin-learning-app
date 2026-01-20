import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth-util";
import { LearningTree } from "@/components/game/LearningTree";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StagesPage() {
    const user = await getOrCreateUser();

    // Fetch all scenarios and their prerequisites/unlocks
    const scenarios = await prisma.scenario.findMany({
        include: {
            character: true,
            prerequisites: {
                select: { id: true }
            },
            unlocks: {
                select: { id: true }
            }
        },
        orderBy: { y: 'asc' }
    });

    // Determine completed scenarios
    const completedScenarioIds = new Set<string>(user?.completedScenarioIds || []);

    return (
        <main className="min-h-screen bg-[#FDFBF7] pt-10 pb-32 overflow-x-hidden">
            <div className="container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-[#C41E3A] mb-6 tracking-tight">
                        The Learning Path
                    </h1>
                    <p className="text-[#5C4B3A] text-xl max-w-2xl mx-auto font-medium mb-10">
                        {user ? `You have mastered ${completedScenarioIds.size} challenges. Each step unlocks new possibilities.` : "Start your journey and master the art of conversation."}
                    </p>

                    {user && (
                        <Link href="/review">
                            <Button className="bg-[#D4AF37] hover:bg-[#B89830] text-white font-bold h-14 px-10 rounded-2xl shadow-xl border-b-4 border-[#A6892C] transition-all transform hover:-translate-y-1 active:translate-y-0 group">
                                <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                                Review Flashcards
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Tree Visualization */}
                <LearningTree
                    scenarios={scenarios}
                    completedScenarioIds={completedScenarioIds}
                />
            </div>
        </main>
    );
}
