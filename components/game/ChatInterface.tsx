"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MapPin, RotateCcw, Languages } from "lucide-react";
import { submitMessage, restartGame } from "@/actions/game";

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
    initialScore?: number | null;
    initialFeedback?: string | null;
    initialCorrections?: any;
    scenario: {
        id: string;
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

export function ChatInterface({
    conversationId,
    initialMessages,
    initialStatus,
    initialScore,
    initialFeedback,
    initialCorrections,
    scenario
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [gameStatus, setGameStatus] = useState(initialStatus);
    const [score, setScore] = useState<number | null>(initialScore || null);
    const [feedback, setFeedback] = useState<string | null>(initialFeedback || null);
    const [corrections, setCorrections] = useState<any[]>(initialCorrections || []);
    const [visibleTranslations, setVisibleTranslations] = useState<Set<string>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);

    const toggleTranslation = (id: string) => {
        setVisibleTranslations((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

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
            if (result.score !== null) setScore(result.score);
            if (result.feedback !== null) setFeedback(result.feedback);
            if (result.corrections) setCorrections(result.corrections);

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
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                            if (confirm("Are you sure you want to start over? Your progress will be lost.")) {
                                window.location.reload(); // Simple way to trigger fresh startGame call
                                // We'll actually implement a clean restart action call here
                                await restartGame(conversationId, scenario.id);
                                window.location.href = `/play/${scenario.id}`;
                            }
                        }}
                        className="text-[#8A7E72] hover:text-[#C41E3A] hover:bg-[#C41E3A]/5 gap-2"
                        disabled={isLoading}
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span className="hidden sm:inline">Start Over</span>
                    </Button>

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
                                                <div className="mt-1">
                                                    {visibleTranslations.has(msg.id) ? (
                                                        <div className="text-sm text-gray-400 italic bg-gray-50/50 p-2 rounded-lg border border-gray-100 relative group/trans">
                                                            {msg.translation}
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleTranslation(msg.id)}
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
                                                            onClick={() => toggleTranslation(msg.id)}
                                                            className="h-7 text-[10px] text-[#8A7E72] hover:text-[#C41E3A] hover:bg-[#C41E3A]/5 gap-1.5 self-start px-2 mt-1"
                                                        >
                                                            <Languages className="w-3 h-3" />
                                                            Show Translation
                                                        </Button>
                                                    )}
                                                </div>
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

                    {/* Report Card Overlay */}
                    {gameStatus !== "ACTIVE" && feedback && (
                        <div className="max-w-3xl mx-auto px-4 md:px-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white border-2 border-[#E8E1D5] rounded-3xl p-8 shadow-xl relative overflow-hidden">
                                <div className="absolute -top-2 -right-2 w-32 h-32 bg-[#C41E3A]/5 rounded-bl-full flex items-center justify-center pt-2 pr-2">
                                    <div className="text-4xl font-serif font-black text-[#C41E3A]">
                                        {score}/100
                                    </div>
                                </div>

                                <h3 className="text-2xl font-serif font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                                    Coach's Report
                                    <span className={`text-sm px-3 py-1 rounded-full uppercase tracking-widest ${gameStatus === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {gameStatus}
                                    </span>
                                </h3>

                                <p className="text-[#5C4B3A] leading-relaxed italic text-lg mb-8">
                                    "{feedback}"
                                </p>

                                {corrections && corrections.length > 0 && (
                                    <div className="mb-8 space-y-4">
                                        <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                            Key Corrections
                                        </h4>
                                        <div className="space-y-3">
                                            {corrections.map((c: any, i: number) => (
                                                <div key={i} className="bg-[#FDFBF7] border border-[#E8E1D5] rounded-xl p-4">
                                                    <div className="flex flex-col gap-2 mb-3">
                                                        <div className="flex flex-col opacity-60">
                                                            <span className="text-xs font-bold text-red-500/70 uppercase tracking-tighter mb-0.5">Your Phrase</span>
                                                            <span className="text-sm line-through decoration-red-200">{c.original}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium italic">{c.originalPinyin}</span>
                                                        </div>
                                                        <div className="h-px bg-[#E8E1D5]/50 w-full my-1" />
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-tighter mb-0.5">Better Way</span>
                                                            <span className="text-lg font-bold text-[#2C2C2C] leading-tight">{c.correction}</span>
                                                            <span className="text-xs text-[#C41E3A] font-semibold tracking-wide">{c.correctionPinyin}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-[#5C4B3A] leading-relaxed border-t border-[#E8E1D5] pt-2 font-medium bg-white/50 -mx-4 px-4 rounded-b-xl">{c.explanation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        onClick={async () => {
                                            await restartGame(conversationId, scenario.id);
                                            window.location.href = `/play/${scenario.id}`;
                                        }}
                                        className="flex-1 bg-[#C41E3A] hover:bg-[#A01830] text-white font-bold h-12 rounded-xl border-b-4 border-[#8A1529]"
                                    >
                                        Try Again
                                    </Button>
                                    <Button
                                        onClick={() => window.location.href = '/stages'}
                                        variant="outline"
                                        className="flex-1 border-2 border-[#E8E1D5] text-[#5C4B3A] font-bold h-12 rounded-xl hover:bg-[#FDFBF7]"
                                    >
                                        Back to Stages
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
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
