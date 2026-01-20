"use client";

import { Button } from "@/components/ui/button";
import { Lightbulb, Volume2 } from "lucide-react";

interface CheatSheetPanelProps {
    keyPhrases: any[];
    onPlayAudio: (text: string, id: string) => void;
    isPlaying: string | null;
}

export function CheatSheetPanel({
    keyPhrases,
    onPlayAudio,
    isPlaying
}: CheatSheetPanelProps) {
    if (!keyPhrases || keyPhrases.length === 0) return null;

    return (
        <div className="absolute top-0 inset-x-0 bg-white/95 backdrop-blur-md border-b border-[#E8E1D5] p-6 z-20 shadow-lg animate-in slide-in-from-top duration-300">
            <div className="max-w-3xl mx-auto">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Useful Expressions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {keyPhrases.map((kp: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 bg-[#FDFBF7] p-3 rounded-xl border border-[#E8E1D5] hover:border-[#D4AF37]/50 transition-colors group">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onPlayAudio(kp.phrase, `cheat-${i}`)}
                                className="h-8 w-8 shrink-0 rounded-full hover:bg-[#C41E3A]/5 text-[#8A7E72] hover:text-[#C41E3A]"
                            >
                                <Volume2 className={`w-4 h-4 ${isPlaying === `cheat-${i}` ? "animate-pulse" : ""}`} />
                            </Button>
                            <div className="flex-1">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-[#2C2C2C]">{kp.phrase}</span>
                                    <span className="text-[10px] text-[#C41E3A] font-medium">{kp.pinyin}</span>
                                    <span className="text-xs text-gray-500 mt-0.5">{kp.translation}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
