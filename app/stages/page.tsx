import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth-util";
import { StageCard } from "@/components/game/StageCard";

export const dynamic = "force-dynamic";

export default async function StagesPage() {
    const user = await getOrCreateUser();

    const scenarios = await prisma.scenario.findMany({
        include: {
            character: true
        }
    });

    // Determine completed scenarios
    const completedScenarioIds = new Set<string>();
    if (user) {
        const completedConversations = await prisma.conversation.findMany({
            where: {
                userId: user.id,
                status: "COMPLETED"
            },
            select: { scenarioId: true }
        });
        completedConversations.forEach(c => completedScenarioIds.add(c.scenarioId));
    }

    const difficultyOrder = ["Beginner", "Intermediate", "Advanced"];
    const groupedScenarios = difficultyOrder.map(difficulty => ({
        difficulty,
        items: scenarios.filter(s => s.difficulty === difficulty)
    })).filter(group => group.items.length > 0);

    return (
        <main className="min-h-screen bg-[#FDFBF7] py-20 pb-32">
            <div className="container mx-auto px-4">
                <div className="mb-20 text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-[#C41E3A] mb-6 tracking-tight">
                        Choose Your Path
                    </h1>
                    <p className="text-[#5C4B3A] text-xl max-w-2xl mx-auto font-medium">
                        {user ? `You have mastered ${completedScenarioIds.size} challenges so far.` : "Select a scenario to start practicing your Mandarin."}
                    </p>
                </div>

                <div className="space-y-24">
                    {groupedScenarios.map((group) => (
                        <div key={group.difficulty} className="relative">
                            <div className="flex items-center gap-6 mb-10">
                                <h2 className="text-2xl font-serif font-bold text-[#2C2C2C] whitespace-nowrap">
                                    {group.difficulty} Levels
                                </h2>
                                <div className="h-px bg-[#E8E1D5] w-full" />
                                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] bg-white px-4 py-1.5 border border-[#E8E1D5] rounded-full shadow-sm">
                                    {group.items.length} {group.items.length === 1 ? 'Stage' : 'Stages'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {group.items.map((scenario) => (
                                    <StageCard
                                        key={scenario.id}
                                        scenario={scenario}
                                        isCompleted={completedScenarioIds.has(scenario.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
