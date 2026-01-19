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

    return (
        <main className="min-h-screen bg-[#FDFBF7] py-20">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#C41E3A] mb-4">
                        Select Your Journey
                    </h1>
                    <p className="text-[#5C4B3A] text-lg max-w-2xl mx-auto">
                        {user ? `Welcome back! You have completed ${completedScenarioIds.size} scenarios.` : "Choose a scenario to practice your Mandarin."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {scenarios.map((scenario) => (
                        <StageCard
                            key={scenario.id}
                            scenario={scenario}
                            isCompleted={completedScenarioIds.has(scenario.id)}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
