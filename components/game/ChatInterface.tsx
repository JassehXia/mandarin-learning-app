"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MapPin } from "lucide-react";
import { submitMessage } from "@/actions/game";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    pinyin?: string;
    translation?: string;
}

interface ChatInterfaceProps {
    conversationId: string;
    initialMessages: Message[];
    initialStatus: string;
    scenario: {
        title: string;
        objective: string;
        location: string;
        character: {
            name: string;
            role: string;
            avatarUrl?: string;
        }
    }
}

export function ChatInterface({ conversationId, initialMessages, initialStatus, scenario }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [gameStatus, setGameStatus] = useState(initialStatus);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        // A small timeout helps with scroll after render
        const timeout = setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
        return () => clearTimeout(timeout);
    }, [messages]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isLoading || gameStatus !== "ACTIVE") return;

        const tempId = Date.now().toString();
        const userMsg: Message = { id: tempId, role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const result = await submitMessage(conversationId, userMsg.content);

            // Add AI response
            const aiMsg: Message = {
                id: result.message.id,
                role: "assistant",
                content: result.message.content,
                pinyin: result.message.pinyin || undefined,
                translation: result.message.translation || undefined
            };
            setMessages((prev) => [...prev, aiMsg]);

            if (result.status !== gameStatus) {
                setGameStatus(result.status);
            }

        } catch (error) {
            console.error("Failed to send message", error);
            // Remove optimistic message on failure? Or show error state.
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex h-screen flex-col bg-[#FDFBF7] text-[#2C2C2C] font-sans">
            {/* HUD Header */}
            <header className="flex items-center justify-between border-b border-[#E8E1D5] bg-white px-4 md:px-6 py-4 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <a href="/" className="text-[#C41E3A] font-bold hover:underline text-sm">
                        ← Stages
                    </a>
                    <div className="flex items-center gap-2 text-[#C41E3A] font-serif font-bold">
                        <MapPin className="h-5 w-5" />
                        <span>{scenario.location}</span>
                    </div>
                    <div className="hidden md:block h-4 w-px bg-[#E8E1D5]" />
                    <div className="hidden md:block text-[#5C4B3A] text-sm">
                        <span className="font-bold mr-2 text-[#D4AF37]">Objective:</span>
                        {scenario.objective}
                    </div>
                </div>
                <div>
                    {/* Status Indicator */}
                    {gameStatus === "COMPLETED" && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider">Success</span>
                    )}
                    {gameStatus === "ACTIVE" && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
                    )}
                    {gameStatus === "FAILED" && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider">Failed</span>
                    )}
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-[#E8E1D5] px-4 py-1 rounded-full text-xs text-[#5C4B3A] shadow-sm z-10 pointer-events-none">
                    Talking to: <span className="font-bold text-[#C41E3A]">{scenario.character.name}</span> ({scenario.character.role})
                </div>

                <ScrollArea className="flex-1 px-4 md:px-6">
                    <div className="flex flex-col gap-6 max-w-3xl mx-auto pt-12 pb-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 text-lg leading-relaxed shadow-sm ${msg.role === "user"
                                        ? "bg-[#C41E3A] text-white rounded-tr-none"
                                        : "bg-white border border-[#E8E1D5] text-[#2C2C2C] rounded-tl-none"
                                        }`}
                                >
                                    <div>{msg.content}</div>
                                    {msg.role === "assistant" && (
                                        <div className="mt-2 pt-2 border-t border-gray-100/50">
                                            {msg.pinyin && (
                                                <div className="text-sm text-gray-500 font-medium mb-1">{msg.pinyin}</div>
                                            )}
                                            {msg.translation && (
                                                <div className="text-sm text-gray-400 italic">{msg.translation}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-[#E8E1D5] px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-[#C41E3A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                    <div className="w-1.5 h-1.5 bg-[#C41E3A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                    <div className="w-1.5 h-1.5 bg-[#C41E3A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} className="h-4" />
                    </div>
                </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="border-t border-[#E8E1D5] bg-white p-4 pb-6 md:pb-8">
                <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-4">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your response..."
                        className="flex-1 border-[#E8E1D5] bg-[#FDFBF7] text-lg h-12 focus-visible:ring-[#C41E3A]"
                        autoFocus
                        disabled={gameStatus !== "ACTIVE" || isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="h-12 w-12 shrink-0 bg-[#C41E3A] hover:bg-[#A01818] text-white rounded-full transition-all shadow-md hover:scale-105"
                        disabled={gameStatus !== "ACTIVE" || isLoading}
                    >
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
