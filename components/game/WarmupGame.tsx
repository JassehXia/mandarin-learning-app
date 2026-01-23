"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, MoveRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KeyPhrase {
    phrase: string;
    pinyin: string;
    translation: string;
}

interface WarmupGameProps {
    keyPhrases: KeyPhrase[];
    onComplete: () => void;
}

export function WarmupGame({ keyPhrases, onComplete }: WarmupGameProps) {
    const [matches, setMatches] = useState<Record<string, string>>({});
    const [shuffledPhrases, setShuffledPhrases] = useState<string[]>([]);
    const [shuffledTranslations, setShuffledTranslations] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
    const [wrongMatch, setWrongMatch] = useState<string | null>(null);
    const [revealedPinyin, setRevealedPinyin] = useState<Set<string>>(new Set());

    useEffect(() => {
        const phrases = keyPhrases.map(kp => kp.phrase);
        const translations = keyPhrases.map(kp => kp.translation);

        setShuffledPhrases([...phrases].sort(() => Math.random() - 0.5));
        setShuffledTranslations([...translations].sort(() => Math.random() - 0.5));
    }, [keyPhrases]);

    const handlePhraseClick = (phrase: string) => {
        if (Object.values(matches).includes(phrase)) return;
        setSelectedPhrase(selectedPhrase === phrase ? null : phrase);
        setWrongMatch(null);
    };

    const togglePinyin = (e: React.MouseEvent, phrase: string) => {
        e.stopPropagation();
        setRevealedPinyin(prev => {
            const next = new Set(prev);
            if (next.has(phrase)) next.delete(phrase);
            else next.add(phrase);
            return next;
        });
    };

    const handleTranslationClick = (translation: string) => {
        if (matches[translation] || !selectedPhrase) return;

        const correctPhrase = keyPhrases.find(kp => kp.translation === translation)?.phrase;

        if (correctPhrase === selectedPhrase) {
            const newMatches = { ...matches, [translation]: selectedPhrase };
            setMatches(newMatches);
            setSelectedPhrase(null);

            if (Object.keys(newMatches).length === keyPhrases.length) {
                setIsComplete(true);
            }
        } else {
            setWrongMatch(selectedPhrase);
            setTimeout(() => setWrongMatch(null), 500);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-0 p-4 sm:p-6 bg-white/80 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] border-2 border-[#E8E1D5] shadow-2xl relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C41E3A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
            />

            <div className="text-center mb-6 relative w-full">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-block px-3 py-1 bg-[#C41E3A]/10 text-[#C41E3A] text-[9px] font-black uppercase tracking-[0.2em] rounded-full mb-2"
                >
                    Challenge 01
                </motion.div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-[#2C2C2C] flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />
                    Vocab Warm-up
                </h2>
                <p className="text-[#8A7E72] mt-1 text-xs font-medium">Click a character, then its meaning to match</p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-8 w-full max-w-2xl relative">
                {/* Chinese Phrases */}
                <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-[9px] font-bold text-[#8A7E72] uppercase tracking-[0.3em] text-center mb-2">Characters</h3>
                    <div className="space-y-2">
                        {shuffledPhrases.map((phrase) => {
                            const isMatched = Object.values(matches).includes(phrase);
                            const isSelected = selectedPhrase === phrase;
                            const isWrong = wrongMatch === phrase;
                            const isPinyinVisible = revealedPinyin.has(phrase);
                            const phraseData = keyPhrases.find(kp => kp.phrase === phrase);

                            return (
                                <motion.button
                                    key={phrase}
                                    layout
                                    onClick={() => handlePhraseClick(phrase)}
                                    animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
                                    transition={{ duration: 0.4 }}
                                    whileHover={!isMatched ? { scale: 1.02, y: -2 } : {}}
                                    whileTap={!isMatched ? { scale: 0.98 } : {}}
                                    className={`w-full h-14 sm:h-16 flex flex-col items-center justify-center rounded-xl sm:rounded-2xl transition-all border-2 group relative
                                        ${isMatched
                                            ? "bg-gray-50 border-gray-100 text-gray-200 cursor-default"
                                            : isSelected
                                                ? "bg-[#C41E3A] border-[#C41E3A] text-white shadow-lg"
                                                : isWrong
                                                    ? "bg-red-50 border-red-200 text-red-700"
                                                    : "bg-white border-[#E8E1D5] text-[#2C2C2C] hover:border-[#C41E3A] hover:text-[#C41E3A] shadow-sm"
                                        }`}
                                >
                                    <span className="text-lg sm:text-xl font-black">{phrase}</span>
                                    {isPinyinVisible && !isMatched && (
                                        <motion.span
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`text-[9px] font-medium tracking-tighter mt-0.5 ${isSelected ? "text-white/70" : "text-[#C41E3A]/70"}`}
                                        >
                                            {phraseData?.pinyin}
                                        </motion.span>
                                    )}
                                    {!isMatched && (
                                        <div
                                            onClick={(e) => togglePinyin(e, phrase)}
                                            className={`absolute bottom-1 right-1 p-1 rounded-full hover:bg-black/5 transition-opacity opacity-0 group-hover:opacity-100
                                                ${isSelected ? "text-white/40 hover:text-white/80" : "text-[#8A7E72] hover:text-[#C41E3A]"}`}
                                        >
                                            {isPinyinVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* English Targets */}
                <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-[9px] font-bold text-[#8A7E72] uppercase tracking-[0.3em] text-center mb-2">Meanings</h3>
                    <div className="space-y-2">
                        {shuffledTranslations.map((trans) => {
                            const matchedPhrase = matches[trans];
                            const phraseData = keyPhrases.find(kp => kp.translation === trans);
                            const isPinyinVisible = matchedPhrase && revealedPinyin.has(matchedPhrase);

                            return (
                                <button
                                    key={trans}
                                    onClick={() => handleTranslationClick(trans)}
                                    className={`w-full h-14 sm:h-16 flex items-center px-4 sm:px-6 rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all border-2 relative overflow-hidden
                                        ${matchedPhrase
                                            ? "bg-green-50 border-green-500/30 text-green-700 shadow-sm cursor-default"
                                            : selectedPhrase
                                                ? "bg-white border-[#C41E3A]/30 text-[#C41E3A] hover:bg-[#C41E3A]/5 border-dashed"
                                                : "bg-[#FDFBF7] border-dashed border-[#E8E1D5] text-[#8A7E72] hover:bg-white"
                                        }`}
                                >
                                    {matchedPhrase ? (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="flex items-center justify-between w-full"
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className="text-lg sm:text-xl font-black leading-none">{matchedPhrase}</span>
                                                {isPinyinVisible && (
                                                    <span className="text-[9px] font-medium opacity-60 tracking-tight">{phraseData?.pinyin}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[8px] font-bold uppercase tracking-tighter opacity-40 leading-none mb-0.5">{trans}</span>
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex items-center justify-center w-full gap-1 opacity-60 font-serif italic text-center leading-tight">
                                            {trans}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isComplete ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 w-full max-w-sm relative z-10"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Button
                                onClick={onComplete}
                                className="w-full h-14 bg-[#C41E3A] hover:bg-[#A01830] text-white font-black rounded-xl text-lg shadow-[0_10px_20px_-5px_rgba(196,30,58,0.4)] border-b-4 border-[#8A1529] flex items-center justify-center gap-3 group transition-all"
                            >
                                START CONVERSATION
                                <MoveRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 text-[9px] font-black text-[#C41E3A] uppercase tracking-[0.4em] animate-pulse"
                    >
                        {selectedPhrase ? "Now select the meaning" : "Select a character"}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
