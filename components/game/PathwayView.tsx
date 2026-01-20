"use client";

import { useState } from "react";
import { LearningTree } from "./LearningTree";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

interface Pathway {
    id: string;
    title: string;
    description: string | null;
    icon: string | null;
}

interface PathwayViewProps {
    pathways: Pathway[];
    scenarios: any[];
    completedScenarioIds: Set<string>;
}

export function PathwayView({ pathways, scenarios, completedScenarioIds }: PathwayViewProps) {
    const [selectedPathwayId, setSelectedPathwayId] = useState(pathways[0]?.id);

    const activeScenarios = scenarios.filter(s => s.pathwayId === selectedPathwayId);
    const selectedPathway = pathways.find(p => p.id === selectedPathwayId);

    return (
        <div className="space-y-12">
            {/* Pathway Selector */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
                {pathways.map((pathway) => {
                    const IconComponent = pathway.icon && (Icons as any)[pathway.icon] ? (Icons as any)[pathway.icon] : Icons.Map;
                    const isActive = selectedPathwayId === pathway.id;

                    return (
                        <button
                            key={pathway.id}
                            onClick={() => setSelectedPathwayId(pathway.id)}
                            className={cn(
                                "flex flex-col items-center gap-3 p-6 rounded-3xl transition-all duration-300 border-2 text-center w-full sm:w-64",
                                isActive
                                    ? "bg-white border-[#C41E3A] shadow-xl scale-105 z-10"
                                    : "bg-[#FDFBF7] border-[#E8E1D5] text-[#8A7E72] hover:border-[#C41E3A]/30 hover:bg-white"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                isActive ? "bg-[#C41E3A] text-white" : "bg-[#E8E1D5]/30 text-[#8A7E72]"
                            )}>
                                <IconComponent className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={cn(
                                    "font-serif font-bold text-lg",
                                    isActive ? "text-[#C41E3A]" : "text-[#5C4B3A]"
                                )}>
                                    {pathway.title}
                                </h3>
                                <p className="text-xs mt-1 leading-relaxed line-clamp-2">
                                    {pathway.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Tree Section Label */}
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-block px-4 py-1.5 bg-[#C41E3A]/5 rounded-full border border-[#C41E3A]/10 mb-4">
                    <p className="text-[10px] font-bold text-[#C41E3A] uppercase tracking-[0.2em]">Current Pathway</p>
                </div>
                <h2 className="text-3xl font-serif font-black text-[#2C2C2C] mb-2">{selectedPathway?.title}</h2>
                <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full" />
            </div>

            {/* Tree Visualization with key for remounting on pathway change to trigger animations */}
            <LearningTree
                key={selectedPathwayId}
                scenarios={activeScenarios}
                completedScenarioIds={completedScenarioIds}
            />
        </div>
    );
}
