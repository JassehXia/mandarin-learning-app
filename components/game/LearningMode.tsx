"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Volume2, CheckCircle2, XCircle, ArrowRight, Home, RefreshCw, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { comparePinyin } from "@/lib/pinyin-compare";
import { convertToToneMarks } from "@/lib/pinyin-input-util";
import { cn } from "@/lib/utils";

interface Flashcard {
    id: string;
    hanzi: string;
    pinyin: string;
    meaning: string;
    explanation?: string | null;
}

interface LearningModeProps {
    initialFlashcards: Flashcard[];
}

export function LearningMode({ initialFlashcards }: LearningModeProps) {
    const [queue, setQueue] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [differences, setDifferences] = useState<Array<{ char: string; isCorrect: boolean; position: number }>>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlayingInput, setIsPlayingInput] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [isToneMode, setIsToneMode] = useState(true);

    // Initialize queue
    useEffect(() => {
        if (initialFlashcards.length > 0) {
            setQueue([...initialFlashcards].sort(() => Math.random() - 0.5));
            setCurrentIndex(0);
            setIsFinished(false);
        }
    }, [initialFlashcards]);

    const playAudio = useCallback((text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setIsPlaying(true);
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang.includes('zh-CN')) || voices.find(v => v.lang.includes('zh'));
        if (zhVoice) utterance.voice = zhVoice;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        if (isToneMode) {
            val = convertToToneMarks(val);
        }
        setUserInput(val);
    };

    const playInputAudio = () => {
        if (!userInput.trim() || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setIsPlayingInput(true);
        const utterance = new SpeechSynthesisUtterance(userInput);
        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang.includes('zh-CN')) || voices.find(v => v.lang.includes('zh'));
        if (zhVoice) utterance.voice = zhVoice;
        utterance.onend = () => setIsPlayingInput(false);
        utterance.onerror = () => setIsPlayingInput(false);
        window.speechSynthesis.speak(utterance);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isSubmitted) return;

        const currentCard = queue[currentIndex];
        const result = comparePinyin(userInput, currentCard.pinyin);

        setIsCorrect(result.isCorrect);
        setDifferences(result.differences);
        setIsSubmitted(true);

        if (result.isCorrect) {
            playAudio(currentCard.hanzi);
        }
    };

    const handleNext = () => {
        if (isCorrect === false) {
            // Re-queue the card if it was wrong
            const cardToRequeue = queue[currentIndex];
            setQueue(prev => [...prev, cardToRequeue]);
        }

        const nextIndex = currentIndex + 1;
        if (nextIndex >= queue.length) {
            setIsFinished(true);
        } else {
            setCurrentIndex(nextIndex);
            setUserInput("");
            setIsSubmitted(false);
            setIsCorrect(null);
            setDifferences([]);
            setShowHint(false);
        }
    };

    if (initialFlashcards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="w-20 h-20 bg-[#C41E3A]/10 rounded-full flex items-center justify-center mb-6">
                    <RefreshCw className="w-10 h-10 text-[#C41E3A] animate-spin-slow" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#2C2C2C] mb-4">No Flashcards</h2>
                <p className="text-[#5C4B3A] max-w-md mb-8">
                    You need some flashcards to start learning. Add flashcards from your lessons!
                </p>
                <Button onClick={() => window.location.href = '/flashcards'} className="bg-[#C41E3A] hover:bg-[#A01830] text-white">
                    Go to Flashcards
                </Button>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-serif font-black text-[#2C2C2C] mb-4">Learning Complete!</h2>
                <p className="text-[#5C4B3A] text-lg mb-10 max-w-sm">
                    Great job! You've practiced all your flashcards.
                </p>
                <div className="flex gap-4">
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="border-2 border-[#E8E1D5] text-[#5C4B3A] font-bold h-12 px-8 rounded-xl"
                    >
                        Practice Again
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/flashcards'}
                        className="bg-[#C41E3A] hover:bg-[#A01830] text-white font-bold h-12 px-8 rounded-xl shadow-lg border-b-4 border-[#8A1529]"
                    >
                        Back to Flashcards
                    </Button>
                </div>
            </div>
        );
    }

    const currentCard = queue[currentIndex];
    if (!currentCard) return null;

    return (
        <div className="max-w-xl mx-auto px-4 py-8 md:py-12">
            {/* Progress Header */}
            <div className="mb-10 space-y-2">
                <div className="flex justify-between items-end text-xs font-bold uppercase tracking-widest text-[#8A7E72]">
                    <span>Learning Session</span>
                    <span>{currentIndex + 1} / {queue.length}</span>
                </div>
                <div className="h-2 bg-[#E8E1D5] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[#D4AF37]"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex) / queue.length) * 100}%` }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="bg-white border-2 border-[#E8E1D5] rounded-3xl p-8 shadow-xl text-center relative overflow-hidden mb-8">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDFBF7] rounded-bl-full z-0 opacity-50" />

                        <div className="relative z-10 flex flex-col items-center">
                            <h3 className="text-6xl md:text-7xl font-bold text-[#2C2C2C] mb-6 font-serif">
                                {currentCard.hanzi}
                            </h3>

                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => playAudio(currentCard.hanzi)}
                                className={`rounded-full h-14 w-14 border-2 transition-all mx-auto flex items-center justify-center mb-6 ${isPlaying ? "bg-[#C41E3A]/10 border-[#C41E3A] text-[#C41E3A]" : "border-[#E8E1D5] text-[#8A7E72] hover:border-[#C41E3A] hover:text-[#C41E3A]"}`}
                            >
                                <Volume2 className={`w-6 h-6 shrink-0 ${isPlaying ? "animate-pulse" : ""}`} />
                            </Button>

                            {/* Hint Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowHint(!showHint)}
                                className="text-xs font-bold text-[#D4AF37] hover:text-[#B89830] hover:bg-[#D4AF37]/5 uppercase tracking-widest mb-4"
                            >
                                {showHint ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                                {showHint ? "Hide" : "Show"} Hint
                            </Button>

                            {showHint && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-lg text-[#5C4B3A] font-medium mb-4 bg-[#FDFBF7] px-6 py-3 rounded-2xl border border-[#EAD0A8]"
                                >
                                    {currentCard.meaning}
                                </motion.p>
                            )}
                        </div>
                    </Card>

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="mb-8">
                        <div className="space-y-4">
                            <div className="relative">
                                <Input
                                    value={userInput}
                                    onChange={handleInputChange}
                                    placeholder="Type the pinyin..."
                                    className="w-full border-2 border-[#E8E1D5] bg-white text-xl h-16 px-6 pr-16 focus-visible:ring-[#C41E3A] rounded-2xl shadow-sm text-center font-medium"
                                    autoFocus
                                    disabled={isSubmitted}
                                />
                                {!isSubmitted && (
                                    <button
                                        type="button"
                                        onClick={playInputAudio}
                                        disabled={!userInput.trim()}
                                        className={cn(
                                            "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all disabled:opacity-30",
                                            isPlayingInput
                                                ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                                                : "bg-gray-100 text-gray-600 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                                        )}
                                        title="Listen to your text"
                                    >
                                        <Volume2 className={cn("w-5 h-5", isPlayingInput && "animate-pulse")} />
                                    </button>
                                )}
                            </div>

                            {/* Show differences if submitted and wrong */}
                            {isSubmitted && !isCorrect && differences.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border-2 border-red-200 rounded-2xl p-4"
                                >
                                    <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-2">Your Answer:</p>
                                    <div className="flex flex-wrap gap-1 justify-center text-2xl font-medium">
                                        {differences.map((diff, idx) => (
                                            <span
                                                key={idx}
                                                className={diff.isCorrect ? "text-green-600" : "text-red-600 bg-red-100 px-1 rounded"}
                                            >
                                                {diff.char}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-green-600 mt-4 mb-2">Correct Answer:</p>
                                    <p className="text-2xl font-medium text-green-600">{currentCard.pinyin}</p>
                                </motion.div>
                            )}

                            {!isSubmitted && (
                                <Button
                                    type="submit"
                                    disabled={!userInput.trim()}
                                    className="w-full bg-[#C41E3A] hover:bg-[#A01830] text-white font-bold h-14 rounded-2xl shadow-lg border-b-4 border-[#8A1529] disabled:opacity-50"
                                >
                                    Check Answer
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* Feedback */}
                    <div className="h-20 flex items-center justify-center">
                        <AnimatePresence>
                            {isSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full"
                                >
                                    {isCorrect ? (
                                        <div className="text-center">
                                            <p className="text-green-600 font-bold mb-4 flex items-center justify-center gap-2">
                                                <CheckCircle2 className="w-5 h-5" /> Perfect!
                                            </p>
                                            <Button
                                                onClick={handleNext}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 rounded-2xl shadow-lg"
                                            >
                                                Next Card <ArrowRight className="ml-2 w-5 h-5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-red-600 font-bold mb-4 flex items-center justify-center gap-2">
                                                <XCircle className="w-5 h-5" /> Not quite. Try again later!
                                            </p>
                                            <Button
                                                onClick={handleNext}
                                                className="w-full bg-[#C41E3A] hover:bg-[#A01830] text-white font-bold h-14 rounded-2xl shadow-lg border-b-4 border-[#8A1529]"
                                            >
                                                Got it <ArrowRight className="ml-2 w-5 h-5" />
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-12 text-center text-[#8A7E72] text-sm">
                <Button
                    variant="link"
                    onClick={() => window.location.href = '/flashcards'}
                    className="text-[#8A7E72] hover:text-[#C41E3A]"
                >
                    <Home className="w-4 h-4 mr-2" /> Back to Flashcards
                </Button>
            </div>
        </div>
    );
}
