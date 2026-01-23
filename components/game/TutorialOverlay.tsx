import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, CheckCircle2, ArrowRight, X, HelpCircle } from "lucide-react";

export type TutorialStep =
    | "WARMUP"
    | "INITIATE"
    | "OBJECTIVE"
    | "PLAYBACK"
    | "PINYIN"
    | "FLASHCARD"
    | "COMPLETE";

interface TutorialOverlayProps {
    currentStep: TutorialStep;
    isMinimized: boolean;
    onToggleMinimize: () => void;
}

const STEP_CONTENT: Record<TutorialStep, { title: string; description: string }> = {
    WARMUP: {
        title: "Warm-up First",
        description: "Complete the vocabulary warm-up game to prepare for your conversation."
    },
    INITIATE: {
        title: "Start the Conversation",
        description: "Try saying hello! Type 'ni3 hao3' (or '你好') in the input box below."
    },
    OBJECTIVE: {
        title: "Check Your Goals",
        description: "Click on the 'Objective' text in the top bar to see what you need to accomplish."
    },
    PLAYBACK: {
        title: "Listen to the AI",
        description: "Click the speaker icon next to a message to hear it pronounced."
    },
    PINYIN: {
        title: "See Pinyin",
        description: "Unsure how to read a character? Click on any Chinese character in a message to see its Pinyin."
    },
    FLASHCARD: {
        title: "Save a Flashcard",
        description: "Click and drag over a word to select it, then click 'Flashcard' to save it for later review."
    },
    COMPLETE: {
        title: "Tutorial Complete!",
        description: "Great job! You've mastered the basics. You can now continue the conversation or try a new scenario."
    }
};

export function TutorialOverlay({ currentStep, isMinimized, onToggleMinimize }: TutorialOverlayProps) {
    const content = STEP_CONTENT[currentStep];

    return (
        <>
            <AnimatePresence mode="wait">
                {!isMinimized && (
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md pointer-events-none"
                    >
                        <div className="bg-[#2C2C2C]/90 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl pointer-events-auto relative">
                            <button
                                onClick={onToggleMinimize}
                                className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
                                title="Minimize Tutorial"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="flex items-start gap-4">
                                <div className="bg-[#D4AF37]/20 p-2 rounded-xl">
                                    {currentStep === "COMPLETE" ? (
                                        <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
                                    ) : (
                                        <Lightbulb className="w-6 h-6 text-[#D4AF37]" />
                                    )}
                                </div>
                                <div className="flex-1 pr-6">
                                    <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                                        {content.title}
                                        {currentStep !== "COMPLETE" && currentStep !== "WARMUP" && (
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-normal opacity-60">
                                                Guided Step
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-gray-300 text-xs leading-relaxed">
                                        {content.description}
                                    </p>
                                </div>
                            </div>
                            {currentStep === "COMPLETE" && (
                                <div className="mt-4 flex justify-end">
                                    <div className="text-[10px] text-[#D4AF37] font-bold flex items-center gap-1">
                                        CONTINUE LEARNING <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        className="fixed bottom-24 right-6 z-[100]"
                    >
                        <button
                            onClick={onToggleMinimize}
                            className="bg-[#D4AF37] hover:bg-[#B8962D] text-white p-3 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-110 active:scale-95 group"
                            title="Show Tutorial"
                        >
                            <HelpCircle className="w-6 h-6" />
                            <span className="max-w-0 overflow-hidden whitespace-nowrap font-bold text-sm group-hover:max-w-xs transition-all duration-300">
                                Need Help?
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
