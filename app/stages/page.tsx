import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth-util";
import { PathwayView } from "@/components/game/PathwayView";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Compass } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StagesPage() {
    const user = await getOrCreateUser();

    // Fetch all pathways
    const pathways = await prisma.pathway.findMany({
        orderBy: { order: 'asc' }
    });

    // Fetch all scenarios and their prerequisites/unlocks
    const scenarios = await prisma.scenario.findMany({
        include: {
            character: true,
            prerequisites: {
                select: { id: true, title: true }
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
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C41E3A]/10 rounded-3xl mb-6 transform rotate-12">
                        <Compass className="w-8 h-8 text-[#C41E3A] transform -rotate-12" />
                    </div>
                    <h1 className="text-4xl md:text-7xl font-serif font-black text-[#C41E3A] mb-6 tracking-tight">
                        Choose Your <span className="italic">Path</span>
                    </h1>
                    <p className="text-[#5C4B3A] text-xl max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
                        {user ? `You have mastered ${completedScenarioIds.size} stages. Which story will you tell today?` : "Embark on a journey through Chinese culture and language."}
                    </p>

                    {user && (
                        <Link href="/flashcards">
                            <Button className="bg-[#D4AF37] hover:bg-[#B89830] text-white font-bold h-14 px-10 rounded-2xl shadow-xl border-b-4 border-[#A6892C] transition-all transform hover:-translate-y-1 active:translate-y-0 group">
                                <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                                Flashcards
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Multiple Pathways View */}
                <PathwayView
                    pathways={pathways}
                    scenarios={scenarios}
                    completedScenarioIds={completedScenarioIds}
                />
            </div>
        </main>
    );
}
