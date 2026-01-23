"use client";

import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface SelectionToolbarProps {
    onAction: (text: string) => void;
}

export function SelectionToolbar({ onAction }: SelectionToolbarProps) {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [selectedText, setSelectedText] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleSelection = () => {
            const selection = window.getSelection();
            const text = selection?.toString().trim() || "";

            // Only show if it contains Chinese characters and is relatively short (phrase-sized)
            const hasChinese = /[\u4e00-\u9fa5]/.test(text);
            const isShort = text.length > 0 && text.length < 50;

            if (selection && text && hasChinese && isShort) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                setPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top + window.scrollY - 10,
                });
                setSelectedText(text);
            } else {
                setPosition(null);
            }
        };

        document.addEventListener("selectionchange", handleSelection);
        return () => document.removeEventListener("selectionchange", handleSelection);
    }, []);

    if (!mounted || !position) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 5 }}
                className="fixed z-[9999] pointer-events-none"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translateX(-50%) translateY(-100%)'
                }}
            >
                <div className="pointer-events-auto bg-[#2C2C2C] text-white px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 backdrop-blur-md">
                    <button
                        onClick={() => onAction(selectedText)}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider hover:text-[#D4AF37] transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Flashcard</span>
                    </button>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2C2C2C] rotate-45 border-r border-b border-white/10 -mt-1" />
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
