"use client";

import { Button } from "@/components/ui/button";
import { MapPin, RotateCcw, Lightbulb, Info } from "lucide-react";
import { restartGame } from "@/actions/game";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ChatHUDProps {
    location: string;
    objective: string;
    conversationId: string;
    scenarioId: string;
    gameStatus: string;
    isLoading: boolean;
    showCheatSheet: boolean;
    onToggleCheatSheet: () => void;
}

export function ChatHUD({
    location,
    objective,
    conversationId,
    scenarioId,
    gameStatus,
    isLoading,
    showCheatSheet,
    onToggleCheatSheet
}: ChatHUDProps) {
    return (
        <header className="flex flex-col sm:flex-row items-center justify-between border-b border-[#E8E1D5] bg-white px-4 md:px-6 py-3 sm:py-4 shadow-sm z-[40]">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-4 mb-2 sm:mb-0 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-[#C41E3A] font-serif font-bold text-sm sm:text-base">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{location}</span>
                </div>
                <div className="hidden sm:block h-4 w-px bg-[#E8E1D5]" />
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="text-[#5C4B3A] text-[10px] sm:text-sm line-clamp-1 text-center sm:text-left hover:text-[#C41E3A] transition-colors group/obj flex items-center gap-1.5 focus:outline-none">
                            <span className="font-bold text-[#D4AF37] whitespace-nowrap">Objective:</span>
                            <span className="truncate">{objective}</span>
                            <Info className="w-3 h-3 opacity-0 group-hover/obj:opacity-100 transition-opacity shrink-0" />
                        </button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#FDFBF7] border-2 border-[#E8E1D5] rounded-3xl sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="font-serif text-[#C41E3A] text-xl flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Your Objective
                            </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 p-5 bg-white rounded-2xl border border-[#E8E1D5] shadow-inner text-[#5C4B3A] leading-relaxed">
                            {objective}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleCheatSheet}
                    className={`gap-2 ${showCheatSheet ? "text-[#C41E3A] bg-[#C41E3A]/5" : "text-[#8A7E72] hover:text-[#C41E3A]"}`}
                >
                    <Lightbulb className="h-4 w-4" />
                    <span className="hidden sm:inline">Cheat Sheet</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                        if (confirm("Are you sure you want to start over? Your progress will be lost.")) {
                            await restartGame(conversationId, scenarioId);
                            window.location.reload();
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
    );
}
