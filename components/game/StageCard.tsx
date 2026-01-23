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
        keyPhrases?: any;
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
        <div className={`group bg-white border ${isCompleted ? "border-green-500/30" : "border-[#E8E1D5]"} rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:border-[#D4AF37] transition-all duration-300 flex flex-col relative`}>
            {isCompleted && (
                <div className="absolute top-4 right-4 text-green-600 bg-green-100 rounded-full p-1 z-10" title="Completed">
                    <CheckCircle className="w-5 h-5" />
                </div>
            )}
            <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="px-3 py-1 rounded-full bg-[#FDFBF7] border border-[#E8E1D5] text-[10px] sm:text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                    {scenario.difficulty}
                </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2C2C2C] mb-2 group-hover:text-[#C41E3A] transition-colors line-clamp-1">
                {scenario.title}
            </h2>
            <p className="text-[#5C4B3A] text-xs sm:text-sm mb-4 sm:mb-6 flex-grow line-clamp-2 sm:line-clamp-3">
                {scenario.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-1 gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 text-xs text-[#8A7E72]">
                    <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span className="truncate">{scenario.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8A7E72]">
                    <User className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span className="truncate">{scenario.character?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8A7E72]">
                    <Trophy className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span className="truncate">{scenario.objective}</span>
                </div>
            </div>

            {scenario.keyPhrases && Array.isArray(scenario.keyPhrases) && scenario.keyPhrases.length > 0 && (
                <div className="mb-6 sm:mb-8 pt-4 border-t border-[#E8E1D5] border-dashed">
                    <h3 className="text-[9px] sm:text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-3">Key Phrases</h3>
                    <div className="flex flex-wrap gap-2">
                        {scenario.keyPhrases.slice(0, 2).map((kp: any, idx: number) => (
                            <div key={idx} className="bg-[#FDFBF7] border border-[#E8E1D5] rounded-lg px-2 py-1.5 transition-colors group-hover:bg-white min-w-0 flex-1 sm:flex-none">
                                <span className="text-[11px] sm:text-xs font-bold text-[#2C2C2C] block truncate">{kp.phrase}</span>
                                <span className="text-[9px] text-gray-400 italic block leading-tight truncate">{kp.translation}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Link
                href={`/play/${scenario.id}`}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-[#C41E3A] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-[#A01830] transition-all active:scale-95 group-hover:translate-y-[-2px]"
            >
                Start Scenario
                <MoveRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
