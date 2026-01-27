"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { submitMessage } from "@/actions/game";
import { ChatHUD } from "./ChatHUD";
import { CheatSheetPanel } from "./CheatSheetPanel";
import { MessageItem } from "./MessageItem";
import { CoachReport } from "./CoachReport";
import { ChatInput } from "./ChatInput";
import { WarmupGame } from "./WarmupGame";
import { SelectionToolbar } from "./SelectionToolbar";
import { AddFlashcardDialog } from "./AddFlashcardDialog";
import { TutorialOverlay, TutorialStep } from "./TutorialOverlay";
import { translateSelection } from "@/actions/flashcards";
import { AnimatePresence, motion } from "framer-motion";
import { pinyin } from "pinyin-pro";

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
        difficulty: string;
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
    const [showWarmup, setShowWarmup] = useState(true);
    const [selectionData, setSelectionData] = useState<{ hanzi: string; pinyin: string; meaning: string } | null>(null);
    const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);
    const [tutorialStep, setTutorialStep] = useState<TutorialStep>("WARMUP");
    const [isTutorialMinimized, setIsTutorialMinimized] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const isTutorial = scenario.id === "tutorial-welcome";

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
        utterance.onend = () => {
            setIsPlaying(null);
            if (isTutorial && tutorialStep === "PLAYBACK") setTutorialStep("PINYIN");
        };
        utterance.onerror = () => setIsPlaying(null);
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (!isTutorial) return;
        if (!showWarmup && tutorialStep === "WARMUP") {
            setTutorialStep("OBJECTIVE");
        }
    }, [showWarmup, isTutorial, tutorialStep]);

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

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Create placeholder for AI message
        const aiMsgId = (Date.now() + 1).toString();
        const placeholderAiMsg: Message = { id: aiMsgId, role: "assistant", content: "" };
        setMessages((prev) => [...prev, placeholderAiMsg]);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId, content: userMsg.content }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            const reader = response.body?.getReader();
            if (!reader) throw new Error("Failed to get stream reader");

            let fullText = "";
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                fullText += chunk;

                // Strip metadata for UI display
                const displayText = fullText.split("---METADATA---")[0].trim();

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === aiMsgId ? { ...msg, content: displayText } : msg
                    )
                );
            }

            // End of stream handling
            const finalContent = fullText.split("---METADATA---")[0].trim();
            const metadataParts = fullText.split("---METADATA---");
            const reportParts = fullText.split("---REPORT---");

            let metadata: any = {};
            if (metadataParts[1]) {
                try {
                    const potentialJson = metadataParts[1].split("---REPORT---")[0].trim();
                    metadata = JSON.parse(potentialJson);
                } catch (e) {
                    console.error("Failed to parse basic metadata", e);
                }
            }

            let reportData: any = null;
            if (reportParts[1]) {
                try {
                    reportData = JSON.parse(reportParts[1].trim());
                } catch (e) {
                    console.error("Failed to parse report data", e);
                }
            }

            // Error Handling for "..." or empty
            if (finalContent === "..." || !finalContent) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === aiMsgId
                            ? { ...msg, content: "抱歉，我刚才走神了。请再说一遍？", translation: "Sorry, I spaced out for a moment. Could you say that again?" }
                            : msg
                    )
                );
            } else {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === aiMsgId
                            ? {
                                ...msg,
                                content: finalContent,
                                pinyin: finalContent ? (
                                    (() => {
                                        try { return pinyin(finalContent); }
                                        catch (e) { console.error("Pinyin error:", e); return ""; }
                                    })()
                                ) : "",
                                translation: metadata.translation || reportData?.translation,
                            }
                            : msg
                    )
                );

                const finalStatus = reportData?.status || metadata.status;
                if (finalStatus && finalStatus !== gameStatus) {
                    setGameStatus(finalStatus);
                }

                if (reportData) {
                    if (reportData.score !== undefined) setScore(reportData.score);
                    if (reportData.feedback) setFeedback(reportData.feedback);
                    if (reportData.corrections) setCorrections(reportData.corrections);
                    if (reportData.suggestedFlashcards) setSuggestedFlashcards(reportData.suggestedFlashcards);
                }

                if (isTutorial && tutorialStep === "INITIATE") {
                    setTutorialStep("PLAYBACK");
                }
            }

        } catch (error) {
            console.error("Failed to send message", error);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === aiMsgId
                        ? { ...msg, content: "发生内部错误。请再试一次或重新组织您的语言。", translation: "An internal error occurred. Please try again or rephrase your message." }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    }

    const handleSelectionAction = async (text: string) => {
        // Clear previous data and open dialog in 'loading' state if desired, 
        // but here we fetch first then open for a smoother feel
        try {
            const data = await translateSelection(text);
            setSelectionData({
                hanzi: text,
                pinyin: data.pinyin,
                meaning: data.meaning
            });
            setIsFlashcardOpen(true);
            if (isTutorial && tutorialStep === "FLASHCARD") setTutorialStep("COMPLETE");
        } catch (error) {
            console.error("Failed to translate selection:", error);
        }
    };

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
                onObjectiveClick={() => {
                    if (isTutorial && tutorialStep === "OBJECTIVE") setTutorialStep("INITIATE");
                }}
            />

            <div className="flex-1 relative overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                    {showWarmup && scenario.keyPhrases?.length > 0 ? (
                        <motion.div
                            key="warmup"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                            className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#FDFBF7]"
                        >
                            <div className="w-full max-w-4xl">
                                <WarmupGame
                                    keyPhrases={scenario.keyPhrases}
                                    onComplete={() => setShowWarmup(false)}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col overflow-hidden"
                        >
                            {showCheatSheet && (
                                <CheatSheetPanel
                                    keyPhrases={scenario.keyPhrases || []}
                                    onPlayAudio={playText}
                                    isPlaying={isPlaying}
                                    difficulty={scenario.difficulty}
                                    conversationId={conversationId}
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
                                            difficulty={scenario.difficulty}
                                            onWordClick={() => {
                                                if (isTutorial && tutorialStep === "PINYIN") setTutorialStep("FLASHCARD");
                                            }}
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {!showWarmup && (
                <ChatInput
                    input={input}
                    setInput={setInput}
                    onSubmit={handleSubmit}
                    disabled={gameStatus !== "ACTIVE" || isLoading}
                    isLoading={isLoading}
                />
            )}

            <SelectionToolbar onAction={handleSelectionAction} />

            <AddFlashcardDialog
                open={isFlashcardOpen}
                onOpenChange={setIsFlashcardOpen}
                initialData={selectionData}
            />

            {isTutorial && (
                <TutorialOverlay
                    currentStep={tutorialStep}
                    isMinimized={isTutorialMinimized}
                    onToggleMinimize={() => setIsTutorialMinimized(!isTutorialMinimized)}
                />
            )}
        </div>
    );
}
