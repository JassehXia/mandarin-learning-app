import { getDashboardStats } from "@/actions/dashboard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityList } from "@/components/dashboard/ActivityList";
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Progress & Quick Actions */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Daily Goal Progress */}
                        <DailyProgress goalPercent={stats.daily.goalPercent} />

                        {/* Lifetime Context */}
                        <div className="bg-[#2D241E] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-24 h-24" />
                            </div>
                            <h3 className="text-xl font-serif font-bold mb-6 relative z-10">Your Legacy</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                    <span className="text-white/60 text-sm font-medium">Scenarios Mastered</span>
                                    <span className="text-xl font-black text-[#D4AF37]">{stats.total.completed}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                    <span className="text-white/60 text-sm font-medium">Flashcards Collected</span>
                                    <span className="text-xl font-black text-[#D4AF37]">{stats.total.flashcards}</span>
                                </div>
                            </div>
                            <Link href="/flashcards" className="mt-8 block">
                                <Button className="w-full bg-[#D4AF37] hover:bg-[#B89830] text-white font-bold h-12 rounded-xl border-b-4 border-[#A6892C]">
                                    Review All Cards
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Recent Activity */}
                    <div className="lg:col-span-2">
                        <ActivityList activities={stats.recentActivity} />
                    </div>
                </div>
            </div>
        </main>
    );
}
