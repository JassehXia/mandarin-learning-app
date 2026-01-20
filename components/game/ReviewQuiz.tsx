"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Volume2, CheckCircle2, XCircle, ArrowRight, Home, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Flashcard {
    id: string;
    hanzi: string;
    pinyin: string;
    meaning: string;
    explanation?: string | null;
}

interface ReviewQuizProps {
    initialFlashcards: Flashcard[];
}

export function ReviewQuiz({ initialFlashcards }: ReviewQuizProps) {
    const [queue, setQueue] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPinyin, setShowPinyin] = useState(false);

    // Initialize queue on mount or if initialFlashcards changes
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

    const generateOptions = useCallback((correctMeaning: string) => {
        const distractors = initialFlashcards
            .filter(f => f.meaning !== correctMeaning)
            .map(f => f.meaning)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        return [correctMeaning, ...distractors].sort(() => Math.random() - 0.5);
    }, [initialFlashcards]);

    useEffect(() => {
        if (queue.length > 0 && currentIndex < queue.length) {
            const currentCard = queue[currentIndex];
            setOptions(generateOptions(currentCard.meaning));
            setSelectedOption(null);
            setIsCorrect(null);
            setShowPinyin(false);
        } else if (queue.length > 0 && currentIndex >= queue.length) {
            setIsFinished(true);
        }
    }, [queue, currentIndex, generateOptions]);

    const handleAnswer = (option: string) => {
        if (selectedOption !== null) return;

        const currentCard = queue[currentIndex];
        const correct = option === currentCard.meaning;

        setSelectedOption(option);
        setIsCorrect(correct);

        if (correct) {
            playAudio(currentCard.hanzi);
        }
    };

    const handleNext = () => {
        if (isCorrect === false) {
            // Re-queue the card if it was wrong
            const cardToRequeue = queue[currentIndex];
            setQueue(prev => [...prev, cardToRequeue]);
        }
        setCurrentIndex(prev => prev + 1);
    };

    if (initialFlashcards.length < 4) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="w-20 h-20 bg-[#C41E3A]/10 rounded-full flex items-center justify-center mb-6">
                    <RefreshCw className="w-10 h-10 text-[#C41E3A] animate-spin-slow" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#2C2C2C] mb-4">More Cards Needed</h2>
                <p className="text-[#5C4B3A] max-w-md mb-8">
                    You need at least 4 saved flashcards to start a review session. Keep practicing and saving new words!
                </p>
                <Button onClick={() => window.location.href = '/stages'} className="bg-[#C41E3A] hover:bg-[#A01830] text-white">
                    Back to Stages
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
                <h2 className="text-3xl font-serif font-black text-[#2C2C2C] mb-4">Session Complete!</h2>
                <p className="text-[#5C4B3A] text-lg mb-10 max-w-sm">
                    Excellent work! You've successfully reviewed all your pending flashcards.
                </p>
                <div className="flex gap-4">
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="border-2 border-[#E8E1D5] text-[#5C4B3A] font-bold h-12 px-8 rounded-xl"
                    >
                        Review Again
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/stages'}
                        className="bg-[#C41E3A] hover:bg-[#A01830] text-white font-bold h-12 px-8 rounded-xl shadow-lg border-b-4 border-[#8A1529]"
                    >
                        Back to Stages
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
                    <span>Current Session</span>
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
                            <h3 className="text-6xl md:text-7xl font-bold text-[#2C2C2C] mb-4 font-serif">
                                {currentCard.hanzi}
                            </h3>
                            {showPinyin ? (
                                <p className="text-xl text-[#C41E3A] font-bold tracking-wide italic mb-6 animate-in fade-in zoom-in-95 duration-300">
                                    {currentCard.pinyin}
                                </p>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPinyin(true)}
                                    className="text-xs font-bold text-[#C41E3A]/40 mb-6 hover:text-[#C41E3A] hover:bg-[#C41E3A]/5 uppercase tracking-widest"
                                >
                                    Show Pinyin
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => playAudio(currentCard.hanzi)}
                                className={`rounded-full h-14 w-14 border-2 transition-all mx-auto flex items-center justify-center ${isPlaying ? "bg-[#C41E3A]/10 border-[#C41E3A] text-[#C41E3A]" : "border-[#E8E1D5] text-[#8A7E72] hover:border-[#C41E3A] hover:text-[#C41E3A]"}`}
                            >
                                <Volume2 className={`w-6 h-6 shrink-0 ${isPlaying ? "animate-pulse" : ""}`} />
                            </Button>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 gap-4">
                        {options.map((option, idx) => {
                            const isCorrectAnswer = option === currentCard.meaning;
                            const isSelected = selectedOption === option;

                            let variant: "outline" | "default" = "outline";
                            let className = "h-16 rounded-2xl border-2 font-bold text-lg transition-all text-left px-6 ";

                            if (isSelected) {
                                if (isCorrectAnswer) {
                                    className += "bg-green-50 border-green-500 text-green-700 ";
                                } else {
                                    className += "bg-red-50 border-red-500 text-red-700 ";
                                }
                            } else if (selectedOption !== null && isCorrectAnswer) {
                                className += "bg-green-50/50 border-green-500/50 text-green-700/50 ";
                            } else {
                                className += "bg-white border-[#E8E1D5] text-[#5C4B3A] hover:border-[#D4AF37] hover:bg-[#FDFBF7] ";
                            }

                            return (
                                <motion.button
                                    key={idx}
                                    disabled={selectedOption !== null}
                                    onClick={() => handleAnswer(option)}
                                    whileHover={selectedOption === null ? { x: 5 } : {}}
                                    whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                                    className={className}
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <span>{option}</span>
                                        {isSelected && (
                                            isCorrectAnswer ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="mt-10 h-20 flex items-center justify-center">
                        <AnimatePresence>
                            {selectedOption !== null && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full"
                                >
                                    {isCorrect ? (
                                        <div className="text-center">
                                            <p className="text-green-600 font-bold mb-4 flex items-center justify-center gap-2">
                                                <CheckCircle2 className="w-5 h-5" /> Correct!
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
                    onClick={() => window.location.href = '/stages'}
                    className="text-[#8A7E72] hover:text-[#C41E3A]"
                >
                    <Home className="w-4 h-4 mr-2" /> Back to Stages
                </Button>
            </div>
        </div>
    );
}
