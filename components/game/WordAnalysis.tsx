"use client";

import { useState } from "react";
import { segment, pinyin } from "pinyin-pro";
import { motion, AnimatePresence } from "framer-motion";

interface WordAnalysisProps {
    content: string;
    onWordClick?: (word: string) => void;
}

export function WordAnalysis({ content, onWordClick }: WordAnalysisProps) {
    const [selectedWord, setSelectedWord] = useState<{
        text: string;
        pinyin: string;
        index: number;
    } | null>(null);

    // Segment the content into words
    const segments = segment(content);

    const handleWordClick = (word: any, index: number) => {
        const text = typeof word === "string" ? word : word.origin;
        if (selectedWord?.index === index) {
            setSelectedWord(null);
        } else {
            const wordPinyin = pinyin(text, { toneType: "symbol" });
            setSelectedWord({ text: text, pinyin: wordPinyin, index });
            onWordClick?.(text);
        }
    };

    return (
        <span className="relative inline">
            {segments.map((segmentItem: any, i) => {
                const word = typeof segmentItem === "string" ? segmentItem : segmentItem.origin;
                const isChinese = /[\u4e00-\u9fa5]/.test(word);

                return (
                    <span key={i} className="relative inline"><span
                        onClick={isChinese ? () => handleWordClick(segmentItem, i) : undefined}
                        className={`cursor-help transition-colors rounded-sm ${isChinese ? "hover:bg-[#C41E3A]/10 hover:text-[#C41E3A]" : ""
                            } ${selectedWord?.index === i ? "bg-[#C41E3A]/20 text-[#C41E3A] font-bold" : ""}`}
                        style={{ display: 'inline' }}
                    >{word}</span><AnimatePresence>
                            {selectedWord?.index === i && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    <div className="bg-[#2C2C2C] text-white px-3 py-2 rounded-xl shadow-xl min-w-[80px] text-center border border-white/10 backdrop-blur-md">
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Pinyin</div>
                                        <div className="text-sm font-bold text-[#D4AF37]">{selectedWord.pinyin}</div>
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2C2C2C] rotate-45 border-r border-b border-white/10" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence></span>
                );
            })}
        </span>
    );
}
