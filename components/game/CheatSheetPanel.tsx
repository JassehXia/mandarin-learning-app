import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, Volume2, Sparkles, Loader2 } from "lucide-react";
import { getAIHints } from "@/actions/game";

interface CheatSheetPanelProps {
    keyPhrases: any[];
    onPlayAudio: (text: string, id: string) => void;
    isPlaying: string | null;
    difficulty: string;
    conversationId: string;
}

export function CheatSheetPanel({
    keyPhrases,
    onPlayAudio,
    isPlaying,
    difficulty,
    conversationId
}: CheatSheetPanelProps) {
    const [hints, setHints] = useState<{ hanzi: string; pinyin: string; meaning: string }[]>([]);
    const [isLoadingHints, setIsLoadingHints] = useState(false);

    const handleGenerateHints = async () => {
        setIsLoadingHints(true);
        try {
            const data = await getAIHints(conversationId);
            setHints(data.hints);
        } catch (error) {
            console.error("Failed to generate hints:", error);
        } finally {
            setIsLoadingHints(false);
        }
    };

    return (
        <div className="absolute top-0 inset-x-0 bg-white/95 backdrop-blur-md border-b border-[#E8E1D5] p-6 z-20 shadow-lg animate-in slide-in-from-top duration-300 max-h-[70vh] overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Fixed Key Phrases */}
                {keyPhrases && keyPhrases.length > 0 && (
                    <div>
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
                                            {difficulty !== "Advanced" && (
                                                <span className="text-[10px] text-[#C41E3A] font-medium">{kp.pinyin}</span>
                                            )}
                                            {difficulty === "Beginner" && (
                                                <span className="text-xs text-gray-500 mt-0.5">{kp.translation}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Powered Hints */}
                <div className="pt-4 border-t border-[#E8E1D5]/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-[#C41E3A] uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Suggestions
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateHints}
                            disabled={isLoadingHints}
                            className="h-8 text-[10px] gap-2 border-[#C41E3A]/20 text-[#C41E3A] hover:bg-[#C41E3A]/5"
                        >
                            {isLoadingHints ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            {hints.length > 0 ? "Regenerate" : "Get Hints"}
                        </Button>
                    </div>

                    {hints.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {hints.map((hint, i) => (
                                <div key={i} className="bg-white p-3 rounded-xl border-2 border-[#C41E3A]/10 hover:border-[#C41E3A]/30 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onPlayAudio(hint.hanzi, `hint-${i}`)}
                                            className="h-6 w-6 rounded-full text-[#C41E3A]"
                                        >
                                            <Volume2 className={`w-3 h-3 ${isPlaying === `hint-${i}` ? "animate-pulse" : ""}`} />
                                        </Button>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <span className="text-lg font-bold text-[#2C2C2C] mb-1">{hint.hanzi}</span>
                                        <span className="text-[9px] text-[#C41E3A] font-bold uppercase tracking-tight mb-1">{hint.pinyin}</span>
                                        <span className="text-[10px] text-gray-500 italic leading-tight">{hint.meaning}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !isLoadingHints && (
                            <div className="text-center py-6 bg-[#FDFBF7] rounded-2xl border-2 border-dashed border-[#E8E1D5] text-[#8A7E72] text-[10px] font-medium uppercase tracking-widest">
                                Stuck? Get contextual hints based on your current conversation!
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
