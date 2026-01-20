"use client";

import { Button } from "@/components/ui/button";
import { MapPin, RotateCcw, Lightbulb } from "lucide-react";
import { restartGame } from "@/actions/game";

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
        <header className="flex items-center justify-between border-b border-[#E8E1D5] bg-white px-4 md:px-6 py-4 shadow-sm z-10">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[#C41E3A] font-serif font-bold">
                    <MapPin className="h-5 w-5" />
                    <span>{location}</span>
                </div>
                <div className="hidden md:block h-4 w-px bg-[#E8E1D5]" />
                <div className="hidden md:block text-[#5C4B3A] text-sm">
                    <span className="font-bold mr-2 text-[#D4AF37]">Objective:</span>
                    {objective}
                </div>
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
