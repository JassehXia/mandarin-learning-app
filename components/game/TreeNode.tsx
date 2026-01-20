"use client";

import { motion } from "framer-motion";
import { Lock, Check, Play, User, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TreeNodeProps {
    scenario: any;
    status: "locked" | "available" | "completed";
}

export function TreeNode({ scenario, status }: TreeNodeProps) {
    const isLocked = status === "locked";
    const isCompleted = status === "completed";
    const isAvailable = status === "available";

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${scenario.x}%`, top: `${scenario.y * 10}px` }} // Using y as a multiplier for vertical spacing
        >
            <div className="relative group">
                {/* Node Circle */}
                <Link
                    href={isLocked ? "#" : `/play/${scenario.id}`}
                    className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-lg",
                        isLocked
                            ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                            : isCompleted
                                ? "bg-green-50 border-green-500 text-green-600 hover:shadow-green-200"
                                : "bg-white border-[#C41E3A] text-[#C41E3A] hover:shadow-[#C41E3A]/20 ring-4 ring-transparent hover:ring-[#C41E3A]/10"
                    )}
                >
                    {isLocked ? (
                        <Lock className="w-8 h-8" />
                    ) : isCompleted ? (
                        <Check className="w-10 h-10 stroke-[3]" />
                    ) : (
                        <Play className="w-8 h-8 fill-current translate-x-0.5" />
                    )}
                </Link>

                {/* Label */}
                <div className={cn(
                    "absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300 z-20",
                    isLocked ? "opacity-50" : "opacity-100"
                )}>
                    <div className="bg-[#FDFBF7]/90 backdrop-blur-sm border border-[#E8E1D5]/50 px-3 py-1.5 rounded-xl shadow-sm whitespace-nowrap text-center">
                        <p className="font-serif font-bold text-sm text-[#2C2C2C] group-hover:text-[#C41E3A] transition-colors">
                            {scenario.title}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-tighter">
                                {scenario.difficulty}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Hover Details Popover */}
                <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 p-4 bg-white rounded-2xl shadow-2xl border border-[#E8E1D5] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-90 group-hover:scale-100 z-50">
                    {isLocked ? (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                    <Lock className="w-4 h-4 text-gray-400" />
                                </div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Locked Stage</p>
                            </div>
                            <p className="text-xs text-[#8A7E72] mb-3">To unlock this challenge, you must first complete:</p>
                            <div className="space-y-1.5">
                                {scenario.missingPrerequisites?.map((title: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2 text-[11px] font-bold text-[#C41E3A] bg-[#C41E3A]/5 px-2 py-1 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#C41E3A] mt-1.5 shrink-0" />
                                        <span>{title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-[#FDFBF7] flex items-center justify-center border border-[#E8E1D5]">
                                    <User className="w-4 h-4 text-[#C41E3A]" />
                                </div>
                                <p className="text-xs font-bold text-[#5C4B3A]">{scenario.character?.name}</p>
                            </div>
                            <p className="text-xs text-[#8A7E72] leading-relaxed mb-3">{scenario.description}</p>
                            <div className="flex items-center gap-1 text-[10px] text-[#A6892C] font-bold">
                                <MapPin className="w-3 h-3" />
                                <span>{scenario.location}</span>
                            </div>
                        </>
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                </div>

            </div>
        </motion.div>
    );
}
