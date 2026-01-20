"use client";

import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { restartGame } from "@/actions/game";

interface CoachReportProps {
    status: string;
    score: number | null;
    feedback: string;
    corrections: any[];
    conversationId: string;
    scenarioId: string;
    onPlayAudio: (text: string, id: string) => void;
    isPlaying: string | null;
}

export function CoachReport({
    status,
    score,
    feedback,
    corrections,
    conversationId,
    scenarioId,
    onPlayAudio,
    isPlaying
}: CoachReportProps) {
    return (
        <div className="max-w-3xl mx-auto px-4 md:px-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border-2 border-[#E8E1D5] rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <h3 className="text-2xl font-serif font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                    Coach's Report
                    <span className={`text-sm px-3 py-1 rounded-full uppercase tracking-widest ${status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {status}
                    </span>
                </h3>

                <p className="text-[#5C4B3A] leading-relaxed italic text-lg mb-8">
                    "{feedback}"
                </p>

                {corrections && corrections.length > 0 && (
                    <div className="mb-8 space-y-4">
                        <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                            Key Corrections
                        </h4>
                        <div className="space-y-3">
                            {corrections.map((c: any, i: number) => (
                                <div key={i} className="bg-[#FDFBF7] border border-[#E8E1D5] rounded-xl p-4">
                                    <div className="flex flex-col gap-2 mb-3">
                                        <div className="flex justify-between items-start group/corr-user">
                                            <div className="flex flex-col opacity-60">
                                                <span className="text-xs font-bold text-red-500/70 uppercase tracking-tighter mb-0.5">Your Phrase</span>
                                                <span className="text-sm line-through decoration-red-200">{c.original}</span>
                                                <span className="text-[10px] text-gray-400 font-medium italic">{c.originalPinyin}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onPlayAudio(c.original, `orig-${i}`)}
                                                className={`h-6 w-6 rounded-full opacity-0 group-hover/corr-user:opacity-100 transition-opacity ${isPlaying === `orig-${i}` ? "opacity-100 text-[#C41E3A] bg-[#C41E3A]/5" : "text-gray-400 hover:text-[#C41E3A] hover:bg-[#C41E3A]/5"}`}
                                            >
                                                <Volume2 className={`w-3 h-3 ${isPlaying === `orig-${i}` ? "animate-pulse" : ""}`} />
                                            </Button>
                                        </div>

                                        <div className="h-px bg-[#E8E1D5]/50 w-full my-1" />

                                        <div className="flex justify-between items-start group/corr-better">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-tighter mb-0.5">Better Way</span>
                                                <span className="text-lg font-bold text-[#2C2C2C] leading-tight">{c.correction}</span>
                                                <span className="text-xs text-[#C41E3A] font-semibold tracking-wide">{c.correctionPinyin}</span>
                                                <span className="text-xs text-gray-400 italic mt-0.5">{c.translation}</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => onPlayAudio(c.correction, `corr-${i}`)}
                                                className={`h-8 w-8 rounded-full transition-all border-[#E8E1D5] ${isPlaying === `corr-${i}` ? "bg-[#C41E3A]/10 text-[#C41E3A] border-[#C41E3A]" : "bg-white text-[#8A7E72] hover:text-[#C41E3A] hover:bg-[#C41E3A]/5"}`}
                                            >
                                                <Volume2 className={`w-4 h-4 ${isPlaying === `corr-${i}` ? "animate-pulse" : ""}`} />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-[#5C4B3A] leading-relaxed border-t border-[#E8E1D5] pt-2 font-medium bg-white/50 -mx-4 px-4 rounded-b-xl">{c.explanation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        onClick={async () => {
                            await restartGame(conversationId, scenarioId);
                            window.location.href = `/play/${scenarioId}`;
                        }}
                        className="flex-1 bg-[#C41E3A] hover:bg-[#A01830] text-white font-bold h-12 rounded-xl border-b-4 border-[#8A1529]"
                    >
                        Try Again
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/stages'}
                        variant="outline"
                        className="flex-1 border-2 border-[#E8E1D5] text-[#5C4B3A] font-bold h-12 rounded-xl hover:bg-[#FDFBF7]"
                    >
                        Back to Stages
                    </Button>
                </div>
            </div>
        </div>
    );
}
