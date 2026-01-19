"use client";

import Link from "next/link";
import { MoveRight, MapPin, User, Trophy, CheckCircle } from "lucide-react";

interface StageCardProps {
    scenario: {
        id: string;
        title: string;
        description: string;
        difficulty: string;
        location: string;
        objective: string;
        character?: {
            name: string;
            avatarUrl?: string | null;
            role: string;
        } | null;
    };
    isCompleted: boolean;
}

export function StageCard({ scenario, isCompleted }: StageCardProps) {
    return (
        <div className={`group bg-white border ${isCompleted ? "border-green-500/30" : "border-[#E8E1D5]"} rounded-2xl p-6 hover:shadow-xl hover:border-[#D4AF37] transition-all duration-300 flex flex-col relative`}>
            {isCompleted && (
                <div className="absolute top-4 right-4 text-green-600 bg-green-100 rounded-full p-1" title="Completed">
                    <CheckCircle className="w-5 h-5" />
                </div>
            )}
            <div className="flex justify-between items-start mb-4">
                <div className="px-3 py-1 rounded-full bg-[#FDFBF7] border border-[#E8E1D5] text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                    {scenario.difficulty}
                </div>
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
}
