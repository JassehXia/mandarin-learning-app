"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { submitMessage } from "@/actions/game";
import { ChatHUD } from "./ChatHUD";
import { CheatSheetPanel } from "./CheatSheetPanel";
import { MessageItem } from "./MessageItem";
import { CoachReport } from "./CoachReport";
import { ChatInput } from "./ChatInput";

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
    initialSuggestedFlashcards?: any;
    scenario: {
        id: string;
        title: string;
        objective: string;
        location: string;
        keyPhrases?: any;
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
    initialSuggestedFlashcards,
    scenario
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [gameStatus, setGameStatus] = useState(initialStatus);
    const [score, setScore] = useState<number | null>(initialScore || null);
    const [feedback, setFeedback] = useState<string | null>(initialFeedback || null);
    const [corrections, setCorrections] = useState<any[]>(initialCorrections || []);
    const [suggestedFlashcards, setSuggestedFlashcards] = useState<any[]>(initialSuggestedFlashcards || []);
    const [visibleTranslations, setVisibleTranslations] = useState<Set<string>>(new Set());
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [showCheatSheet, setShowCheatSheet] = useState(false);
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

    const playText = (text: string, id: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setIsPlaying(id);
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang.includes('zh-CN') || v.lang.includes('zh-TW')) || voices.find(v => v.lang.includes('zh'));
        if (zhVoice) utterance.voice = zhVoice;
        utterance.onend = () => setIsPlaying(null);
        utterance.onerror = () => setIsPlaying(null);
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
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
            const aiMsg: Message = {
                id: result.message.id,
                role: "assistant",
                content: result.message.content,
                pinyin: result.message.pinyin || undefined,
                translation: result.message.translation || undefined
            };
            setMessages((prev) => [...prev, aiMsg]);

            if (result.status !== gameStatus) setGameStatus(result.status);
            if (result.score !== null) setScore(result.score);
            if (result.feedback !== null) setFeedback(result.feedback);
            if (result.corrections) setCorrections(result.corrections);
            if (result.suggestedFlashcards) setSuggestedFlashcards(result.suggestedFlashcards);
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex h-screen flex-col bg-[#FDFBF7] text-[#2C2C2C] font-sans">
            <ChatHUD
                location={scenario.location}
                objective={scenario.objective}
                conversationId={conversationId}
                scenarioId={scenario.id}
                gameStatus={gameStatus}
                isLoading={isLoading}
                showCheatSheet={showCheatSheet}
                onToggleCheatSheet={() => setShowCheatSheet(!showCheatSheet)}
            />

            <div className="flex-1 relative overflow-hidden flex flex-col">
                {showCheatSheet && (
                    <CheatSheetPanel
                        keyPhrases={scenario.keyPhrases}
                        onPlayAudio={playText}
                        isPlaying={isPlaying}
                    />
                )}

                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-[#E8E1D5] px-4 py-1 rounded-full text-xs text-[#5C4B3A] shadow-sm z-10 pointer-events-none">
                    Talking to: <span className="font-bold text-[#C41E3A]">{scenario.character.name}</span> ({scenario.character.role})
                </div>

                <ScrollArea className="flex-1 px-4 md:px-6">
                    <div className="flex flex-col gap-6 max-w-3xl mx-auto pt-12 pb-4">
                        {messages.map((msg) => (
                            <MessageItem
                                key={msg.id}
                                message={msg}
                                onPlayAudio={playText}
                                isPlaying={isPlaying}
                                isTranslationVisible={visibleTranslations.has(msg.id)}
                                onToggleTranslation={toggleTranslation}
                            />
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

                    {gameStatus !== "ACTIVE" && feedback && (
                        <CoachReport
                            status={gameStatus}
                            score={score}
                            feedback={feedback}
                            corrections={corrections}
                            suggestedFlashcards={suggestedFlashcards}
                            conversationId={conversationId}
                            scenarioId={scenario.id}
                            onPlayAudio={playText}
                            isPlaying={isPlaying}
                        />
                    )}
                </ScrollArea>
            </div>

            <ChatInput
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                disabled={gameStatus !== "ACTIVE" || isLoading}
                isLoading={isLoading}
            />
        </div>
    );
}
