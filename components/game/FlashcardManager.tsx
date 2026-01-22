"use client";

import { useState } from "react";
import { Trash2, BookOpen, Volume2, GraduationCap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { deleteFlashcard } from "@/actions/flashcards";
import { useRouter } from "next/navigation";
import { AddFlashcardDialog } from "./AddFlashcardDialog";

interface Flashcard {
    id: string;
    hanzi: string;
    pinyin: string;
    meaning: string;
    explanation?: string | null;
}

interface FlashcardManagerProps {
    flashcards: Flashcard[];
}

export function FlashcardManager({ flashcards }: FlashcardManagerProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteFlashcard(id);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete flashcard:", error);
        } finally {
            setDeletingId(null);
        }
    };

    const playAudio = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang.includes('zh-CN')) || voices.find(v => v.lang.includes('zh'));
        if (zhVoice) utterance.voice = zhVoice;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 p-6 rounded-3xl border-2 border-[#EAD0A8]/30 backdrop-blur-sm">
                <div>
                    <h2 className="text-2xl font-serif font-black text-[#5C4B3A]">Your Collection</h2>
                    <p className="text-[#8A7E72] font-medium">You have {flashcards.length} cards in your deck.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <AddFlashcardDialog />
                    {flashcards.length >= 4 && (
                        <>
                            <Button
                                onClick={() => router.push("/review?mode=quiz")}
                                className="bg-[#D4AF37] hover:bg-[#B89830] text-white rounded-xl h-12 px-6 shadow-lg border-b-4 border-[#A6892C] transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:border-b-0"
                            >
                                <GraduationCap className="w-5 h-5 mr-2" /> Quiz Mode
                            </Button>
                            <Button
                                onClick={() => router.push("/review?mode=learning")}
                                className="bg-[#C41E3A] hover:bg-[#A01830] text-white rounded-xl h-12 px-6 shadow-lg border-b-4 border-[#801326] transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:border-b-0"
                            >
                                <Brain className="w-5 h-5 mr-2" /> Learning Mode
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {flashcards.length === 0 ? (
                <div className="text-center py-20 bg-white/20 rounded-3xl border-2 border-dashed border-[#EAD0A8]">
                    <div className="w-20 h-20 bg-[#EAD0A8]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-[#8A7E72]" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#5C4B3A] mb-2">No flashcards yet</h3>
                    <p className="text-[#8A7E72] mb-8">Add some words from your lessons or create your own!</p>
                    <AddFlashcardDialog />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {flashcards.map((card) => (
                            <motion.div
                                key={card.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="group bg-white border-2 border-[#EAD0A8] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FDFBF7] rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500" />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-4xl font-bold text-[#2C2C2C] font-serif mb-1 group-hover:text-[#C41E3A] transition-colors">
                                                    {card.hanzi}
                                                </h3>
                                                <p className="text-sm text-[#C41E3A] font-bold italic">{card.pinyin}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => playAudio(card.hanzi)}
                                                    className="h-10 w-10 rounded-full text-[#8A7E72] hover:text-[#C41E3A] hover:bg-[#C41E3A]/5"
                                                >
                                                    <Volume2 className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(card.id)}
                                                    disabled={deletingId === card.id}
                                                    className="h-10 w-10 rounded-full text-[#8A7E72] hover:text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className={`h-5 w-5 ${deletingId === card.id ? "animate-pulse" : ""}`} />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EAD0A8]/50">
                                                <span className="text-xs font-bold uppercase tracking-widest text-[#8A7E72] block mb-1">Meaning</span>
                                                <p className="text-[#5C4B3A] font-medium leading-tight">{card.meaning}</p>
                                            </div>

                                            {card.explanation && (
                                                <div className="px-1">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-[#8A7E72] block mb-1">Note</span>
                                                    <p className="text-[#8A7E72] text-sm leading-relaxed">{card.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
