"use client";

import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { convertPinyinToHanzi } from "@/actions/game";

interface AudioButtonProps {
    /** The Chinese text (hanzi) or Pinyin to speak */
    text: string;
    /** Whether the text is pinyin (needs translation for accurate TTS) */
    isPinyin?: boolean;
    /** Optional className for styling */
    className?: string;
    /** Button variant */
    variant?: "default" | "outline" | "ghost";
    /** Button size */
    size?: "default" | "sm" | "lg" | "icon";
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Label for the button */
    label?: string;
}

export function AudioButton({
    text,
    isPinyin = false,
    className,
    variant = "outline",
    size = "lg",
    disabled = false,
    label
}: AudioButtonProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const playAudio = async () => {
        if (!text || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        let textToSpeak = text;

        if (isPinyin) {
            setIsLoading(true);
            try {
                // Convert pinyin to hanzi for better TTS pronunciation
                textToSpeak = await convertPinyinToHanzi(text);
            } catch (error) {
                console.error("Failed to convert pinyin to hanzi for audio:", error);
                // Fallback to original text if conversion fails
                textToSpeak = text;
            } finally {
                setIsLoading(false);
            }
        }

        setIsPlaying(true);
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang.includes('zh-CN')) || voices.find(v => v.lang.includes('zh'));

        if (zhVoice) {
            utterance.voice = zhVoice;
        }

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                playAudio();
            }}
            disabled={disabled || isLoading || !text.trim()}
            className={cn(
                "transition-all flex items-center gap-2",
                isPlaying && "bg-[#C41E3A]/10 border-[#C41E3A] text-[#C41E3A]",
                className
            )}
            title={isPinyin ? "Listen to your pinyin" : "Listen to pronunciation"}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            ) : (
                <Volume2 className={cn(size === "sm" ? "w-4 h-4" : "w-5 h-5", "shrink-0", isPlaying && "animate-pulse")} />
            )}
            {label && <span className="font-bold uppercase tracking-widest text-[10px]">{label}</span>}
        </Button>
    );
}
