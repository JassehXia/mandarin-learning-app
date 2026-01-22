import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth-util";
import { getDashboardStats } from "@/actions/dashboard";
import { PathwayView } from "@/components/game/PathwayView";
import { DailyProgress } from "@/components/game/DailyProgress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Compass } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StagesPage() {
    const user = await getOrCreateUser();
    const stats = await getDashboardStats();

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
        <main className="h-[calc(100vh-64px)] bg-[#FDFBF7] flex flex-col overflow-hidden">
            {/* Header / Intro Section - Compact for full-screen view */}
            <div className="container mx-auto px-4 pt-6 pb-4 flex flex-col items-center">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-[#C41E3A]/10 rounded-2xl flex items-center justify-center transform rotate-12">
                        <Compass className="w-5 h-5 text-[#C41E3A] transform -rotate-12" />
                    </div>
                    <h1 className="text-3xl font-serif font-black text-[#C41E3A] tracking-tight">
                        Your <span className="italic">Journey</span>
                    </h1>
                </div>


            </div>

            {/* Multiple Pathways View - Now takes up remaining space */}
            <div className="flex-1 min-h-0 container mx-auto px-4 pb-6">
                <PathwayView
                    pathways={pathways}
                    scenarios={scenarios}
                    completedScenarioIds={completedScenarioIds}
                />
            </div>
        </main>
    );
}
