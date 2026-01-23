"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Keyboard, Info } from "lucide-react";
import { convertToToneMarks } from "@/lib/pinyin-input-util";
import { cn } from "@/lib/utils";
import { AudioButton } from "@/components/ui/AudioButton";

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
    isLoading,
}: ChatInputProps) {
    const [isToneMode, setIsToneMode] = useState(true);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        if (isToneMode) {
            val = convertToToneMarks(val);
        }
        setInput(val);
    };

    return (
        <div className="border-t border-[#E8E1D5] bg-white p-4 pb-6 sm:pb-8">
            <div className="mx-auto max-w-3xl">
                <form onSubmit={onSubmit} className="flex gap-3 sm:gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your response..."
                            className="w-full border-[#E8E1D5] bg-[#FDFBF7] text-base sm:text-lg h-14 pr-24 sm:pr-28 focus-visible:ring-[#C41E3A] rounded-2xl shadow-sm transition-all"
                            autoFocus
                            disabled={disabled}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-0.5 sm:gap-1">
                            <AudioButton
                                text={input}
                                isPinyin={true}
                                size="sm"
                                variant="ghost"
                                disabled={!input.trim() || disabled}
                                label=""
                            />
                            <button
                                type="button"
                                onClick={() => setIsToneMode(!isToneMode)}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    isToneMode
                                        ? "bg-[#C41E3A]/10 text-[#C41E3A] hover:bg-[#C41E3A]/20"
                                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                )}
                                title={isToneMode ? "Tone marks enabled (ni3 -> nǐ)" : "Tone marks disabled"}
                            >
                                <Keyboard className="w-5 h-5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        size="icon"
                        className="h-14 w-14 shrink-0 bg-[#C41E3A] hover:bg-[#A01830] text-white rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                        disabled={disabled || !input.trim() || isLoading}
                    >
                        <Send className="h-6 w-6 sm:h-5 sm:w-5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>

                {isToneMode && (
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[9px] sm:text-[10px] font-bold text-[#A6892C] uppercase tracking-widest text-center">
                        <div className="flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            <span>ni3 → nǐ</span>
                        </div>
                        <div className="hidden sm:block w-1 h-1 rounded-full bg-[#E8E1D5]" />
                        <span>v → ü</span>
                    </div>
                )}
            </div>
        </div>
    );
}
