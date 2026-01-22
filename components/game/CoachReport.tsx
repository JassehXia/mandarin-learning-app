"use client";

import { Button } from "@/components/ui/button";
import { Volume2, Bookmark, BookmarkCheck, Sparkles, Loader2 } from "lucide-react";
import { restartGame } from "@/actions/game";
import { useState } from "react";
import { saveFlashcard, saveFlashcardsBatch } from "@/actions/flashcards";

interface CoachReportProps {
    status: string;
    score: number | null;
    feedback: string;
    corrections: any[];
    suggestedFlashcards: any[];
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
    suggestedFlashcards,
    conversationId,
    scenarioId,
    onPlayAudio,
    isPlaying
}: CoachReportProps) {
    const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [savingId, setSavingId] = useState<number | null>(null);

    const handleSaveOne = async (flashcard: any, index: number) => {
        setSavingId(index);
        try {
            await saveFlashcard(flashcard);
            setSavedIds(prev => new Set(prev).add(index));
        } catch (error) {
            console.error("Failed to save flashcard", error);
        } finally {
            setSavingId(null);
        }
    };

    const handleSaveAll = async () => {
        setIsSavingAll(true);
        try {
            const toSave = suggestedFlashcards.filter((_, i) => !savedIds.has(i));
            if (toSave.length > 0) {
                await saveFlashcardsBatch(toSave);
                setSavedIds(new Set(suggestedFlashcards.map((_, i) => i)));
            }
        } catch (error) {
            console.error("Failed to save flashcards", error);
        } finally {
            setIsSavingAll(false);
        }
    };
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
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-tighter">Better Way</span>
                                                    {c.category && (
                                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#F5F1EA] text-[#8C7A66] border border-[#E8E1D5] uppercase tracking-wider">
                                                            {c.category}
                                                        </span>
                                                    )}
                                                </div>
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

                {suggestedFlashcards && suggestedFlashcards.length > 0 && (
                    <div className="mb-10 space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-[#C41E3A] uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#C41E3A]" />
                                Review Flashcards
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSaveAll}
                                disabled={isSavingAll || savedIds.size === suggestedFlashcards.length}
                                className="text-xs font-bold text-[#C41E3A] hover:bg-[#C41E3A]/5"
                            >
                                {isSavingAll ? (
                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                ) : savedIds.size === suggestedFlashcards.length ? (
                                    <BookmarkCheck className="w-3 h-3 mr-1" />
                                ) : (
                                    <Bookmark className="w-3 h-3 mr-1" />
                                )}
                                {savedIds.size === suggestedFlashcards.length ? "All Saved" : "Save All"}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {suggestedFlashcards.map((f: any, i: number) => (
                                <div key={i} className="bg-white border-2 border-[#E8E1D5]/50 rounded-2xl p-4 flex justify-between items-center group hover:border-[#C41E3A]/30 transition-colors">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold text-[#2C2C2C]">{f.hanzi}</span>
                                            <span className="text-[10px] text-[#C41E3A] font-medium tracking-tight bg-[#C41E3A]/5 px-1.5 py-0.5 rounded">{f.pinyin}</span>
                                        </div>
                                        <span className="text-xs text-[#5C4B3A] font-medium mt-1">{f.meaning}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={savedIds.has(i) || savingId === i}
                                        onClick={() => handleSaveOne(f, i)}
                                        className={`h-9 w-9 rounded-xl ${savedIds.has(i) ? "text-green-500 bg-green-50" : "text-[#8A7E72] hover:text-[#C41E3A] hover:bg-[#C41E3A]/5"}`}
                                    >
                                        {savingId === i ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : savedIds.has(i) ? (
                                            <BookmarkCheck className="w-4 h-4" />
                                        ) : (
                                            <Bookmark className="w-4 h-4" />
                                        )}
                                    </Button>
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
