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

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Pathway Selector - More compact */}
            <div className="flex flex-wrap justify-center gap-2">
                {pathways.map((pathway) => {
                    const IconComponent = pathway.icon && (Icons as any)[pathway.icon] ? (Icons as any)[pathway.icon] : Icons.Map;
                    const isActive = selectedPathwayId === pathway.id;

                    return (
                        <button
                            key={pathway.id}
                            onClick={() => setSelectedPathwayId(pathway.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border-2 text-left",
                                isActive
                                    ? "bg-white border-[#C41E3A] shadow-md scale-105 z-10"
                                    : "bg-[#FDFBF7] border-[#E8E1D5] text-[#8A7E72] hover:border-[#C41E3A]/30 hover:bg-white"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                                isActive ? "bg-[#C41E3A] text-white" : "bg-[#E8E1D5]/30 text-[#8A7E72]"
                            )}>
                                <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <h3 className={cn(
                                    "font-serif font-bold text-sm truncate",
                                    isActive ? "text-[#C41E3A]" : "text-[#5C4B3A]"
                                )}>
                                    {pathway.title}
                                </h3>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Tree visualization - Fills remaining space */}
            <div className="flex-1 min-h-0">
                <LearningTree
                    key={selectedPathwayId}
                    scenarios={activeScenarios}
                    completedScenarioIds={completedScenarioIds}
                />
            </div>
        </div>
    );
}
