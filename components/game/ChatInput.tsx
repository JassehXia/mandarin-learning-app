"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Keyboard, Info, Volume2 } from "lucide-react";
import { convertToToneMarks } from "@/lib/pinyin-input-util";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    input: string;
    setInput: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    disabled: boolean;
    isLoading: boolean;
}

export function ChatInput({
    input,
    setInput,
    onSubmit,
    disabled,
    isLoading
}: ChatInputProps) {
    const [isToneMode, setIsToneMode] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        if (isToneMode) {
            val = convertToToneMarks(val);
        }
        setInput(val);
    };

    const playAudio = () => {
        if (!input.trim() || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setIsPlaying(true);
        const utterance = new SpeechSynthesisUtterance(input);
        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang.includes('zh-CN')) || voices.find(v => v.lang.includes('zh'));
        if (zhVoice) utterance.voice = zhVoice;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="border-t border-[#E8E1D5] bg-white p-4 pb-4 md:pb-6">
            <div className="mx-auto max-w-3xl">
                <form onSubmit={onSubmit} className="flex gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your response..."
                            className="w-full border-[#E8E1D5] bg-[#FDFBF7] text-lg h-12 pr-20 focus-visible:ring-[#C41E3A] rounded-2xl shadow-sm transition-all"
                            autoFocus
                            disabled={disabled}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            <button
                                type="button"
                                onClick={playAudio}
                                disabled={!input.trim() || disabled}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all disabled:opacity-30",
                                    isPlaying
                                        ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                                        : "bg-gray-100 text-gray-600 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                                )}
                                title="Listen to your text"
                            >
                                <Volume2 className={cn("w-4 h-4", isPlaying && "animate-pulse")} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsToneMode(!isToneMode)}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    isToneMode
                                        ? "bg-[#C41E3A]/10 text-[#C41E3A] hover:bg-[#C41E3A]/20"
                                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                )}
                                title={isToneMode ? "Tone marks enabled (ni3 -> nǐ)" : "Tone marks disabled"}
                            >
                                <Keyboard className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        size="icon"
                        className="h-12 w-12 shrink-0 bg-[#C41E3A] hover:bg-[#A01830] text-white rounded-2xl transition-all shadow-md hover:scale-105 active:scale-95 disabled:opacity-50"
                        disabled={disabled || !input.trim() || isLoading}
                    >
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>

                {isToneMode && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-bold text-[#A6892C] uppercase tracking-widest animate-in fade-in slide-in-from-top-1 duration-500">
                        <Info className="w-3 h-3" />
                        <span>Tip: Type numbers for tones (e.g., "ni3" → "nǐ")</span>
                        <div className="w-1 h-1 rounded-full bg-[#E8E1D5] mx-1" />
                        <span>Type "v" for "ü"</span>
                    </div>
                )}
            </div>
        </div>
    );
}
