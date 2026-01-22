import { getDashboardStats } from "@/actions/dashboard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityList } from "@/components/dashboard/ActivityList";
import { MistakeAnalysis } from "@/components/dashboard/MistakeAnalysis";
import { DailyProgress } from "@/components/game/DailyProgress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Trophy,
    Sparkles,
    LayoutDashboard,
    ChevronRight,
    Target,
    BookOpen
} from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    if (!stats) {
        redirect("/");
    }

    return (
        <main className="min-h-screen bg-[#FDFBF7] pt-10 pb-32">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C41E3A]/10 text-[#C41E3A] text-xs font-bold uppercase tracking-wider mb-4">
                            <LayoutDashboard className="w-3 h-3" />
                            Your Progress
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif font-black text-[#2D241E] tracking-tight">
                            Personal <span className="italic">Stats</span>
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/stages">
                            <Button className="bg-[#C41E3A] hover:bg-[#A01830] text-white font-bold h-12 px-6 rounded-xl shadow-lg border-b-4 border-[#801428] transition-all transform hover:-translate-y-1 active:translate-y-0 group">
                                Continue Journey
                                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Focus: Today's Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-stretch">
                    <StatsCard
                        title="Today's Mastery"
                        value={stats.daily.completed}
                        description={`${stats.daily.completed >= 3 ? 'Daily goal reached!' : `${3 - stats.daily.completed} more to reach goal`}`}
                        icon={Target}
                        color="text-blue-500"
                    />
                    <StatsCard
                        title="New Flashcards"
                        value={stats.daily.flashcards}
                        description="Added to your collection today"
                        icon={Sparkles}
                        color="text-[#D4AF37]"
                    />
                    <StatsCard
                        title="Daily Avg Score"
                        value={`${stats.daily.avgScore}%`}
                        description="Quality of your conversations"
                        icon={Trophy}
                        color="text-orange-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* 1. Daily Goal */}
                    <div className="lg:col-span-1">
                        <DailyProgress goalPercent={stats.daily.goalPercent} />
                    </div>

                    {/* 2. Recent Activity */}
                    <div className="lg:col-span-1">
                        <ActivityList activities={stats.recentActivity} />
                    </div>

                    {/* 3. Mistake Analysis */}
                    <div className="lg:col-span-1">
                        <MistakeAnalysis mistakes={stats.daily.mistakes} />
                    </div>
                </div>
            </div>
        </main>
    );
}
