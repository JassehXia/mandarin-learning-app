"use client";

import { Button } from "@/components/ui/button";
import { Languages, Volume2 } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    pinyin?: string;
    translation?: string;
}

interface MessageItemProps {
    message: Message;
    onPlayAudio: (text: string, id: string) => void;
    isPlaying: string | null;
    isTranslationVisible: boolean;
    onToggleTranslation: (id: string) => void;
}

export function MessageItem({
    message,
    onPlayAudio,
    isPlaying,
    isTranslationVisible,
    onToggleTranslation
}: MessageItemProps) {
    const isAssistant = message.role === "assistant";

    return (
        <div className={`flex w-full ${!isAssistant ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 text-lg leading-relaxed shadow-sm ${!isAssistant
                    ? "bg-[#C41E3A] text-white rounded-tr-none"
                    : "bg-white border border-[#E8E1D5] text-[#2C2C2C] rounded-tl-none"
                    }`}
            >
                <div>{message.content}</div>
                {isAssistant && (
                    <div className="mt-2 pt-2 border-t border-gray-100/50">
                        {message.pinyin && (
                            <div className="text-sm text-gray-500 font-medium mb-1">{message.pinyin}</div>
                        )}
                        {message.translation && (
                            <div className="mt-1 flex items-center gap-2">
                                {isTranslationVisible ? (
                                    <div className="text-sm text-gray-400 italic bg-gray-50/50 p-2 rounded-lg border border-gray-100 relative group/trans flex-1">
                                        {message.translation}
                                        <button
                                            type="button"
                                            onClick={() => onToggleTranslation(message.id)}
                                            className="absolute top-1 right-1 opacity-0 group-hover/trans:opacity-100 transition-opacity text-[10px] text-gray-300 hover:text-[#C41E3A]"
                                            title="Hide Translation"
                                        >
                                            Hide
                                        </button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onToggleTranslation(message.id)}
                                        className="h-7 text-[10px] text-[#8A7E72] hover:text-[#C41E3A] hover:bg-[#C41E3A]/5 gap-1.5 px-2 mt-1"
                                    >
                                        <Languages className="w-3 h-3" />
                                        Show Translation
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onPlayAudio(message.content, message.id)}
                                    className={`h-7 w-7 rounded-full transition-colors border-[#E8E1D5] ${isPlaying === message.id ? "bg-[#C41E3A]/10 text-[#C41E3A] border-[#C41E3A]" : "bg-white text-[#8A7E72] hover:text-[#C41E3A] hover:bg-[#C41E3A]/5"}`}
                                    title="Listen"
                                >
                                    <Volume2 className={`w-3.5 h-3.5 ${isPlaying === message.id ? "animate-pulse" : ""}`} />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
