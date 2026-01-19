import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MoveRight, MapPin, User, Trophy, CheckCircle } from "lucide-react";
import { getOrCreateUser } from "@/lib/auth-util";

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
                    {scenarios.map((scenario) => {
                        const isCompleted = completedScenarioIds.has(scenario.id);
                        return (
                            <div key={scenario.id} className={`group bg-white border ${isCompleted ? "border-green-500/30" : "border-[#E8E1D5]"} rounded-2xl p-6 hover:shadow-xl hover:border-[#D4AF37] transition-all duration-300 flex flex-col relative`}>
                                {isCompleted && (
                                    <div className="absolute top-4 right-4 text-green-600 bg-green-100 rounded-full p-1" title="Completed">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-3 py-1 rounded-full bg-[#FDFBF7] border border-[#E8E1D5] text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                                        {scenario.difficulty}
                                    </div>
                                    {scenario.character?.avatarUrl && (
                                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                            <div className="w-full h-full bg-[#C41E3A]/10 flex items-center justify-center text-[#C41E3A] font-bold">
                                                {scenario.character.name[0]}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-2xl font-serif font-bold text-[#2C2C2C] mb-2 group-hover:text-[#C41E3A] transition-colors">
                                    {scenario.title}
                                </h2>
                                <p className="text-[#5C4B3A] text-sm mb-6 flex-grow line-clamp-3">
                                    {scenario.description}
                                </p>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-2 text-sm text-[#8A7E72]">
                                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                                        <span>{scenario.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[#8A7E72]">
                                        <User className="w-4 h-4 text-[#D4AF37]" />
                                        <span>{scenario.character?.name || "Unknown"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[#8A7E72]">
                                        <Trophy className="w-4 h-4 text-[#D4AF37]" />
                                        <span className="truncate">{scenario.objective}</span>
                                    </div>
                                </div>

                                <Link
                                    href={`/play/${scenario.id}`}
                                    className="w-full py-4 rounded-xl bg-[#C41E3A] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#A01830] transition-colors group-hover:translate-y-[-2px]"
                                >
                                    Start Scenario
                                    <MoveRight className="w-4 h-4" />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
