"use client";

import { useMemo } from "react";
import { TreeNode } from "./TreeNode";

interface LearningTreeProps {
    scenarios: any[];
    completedScenarioIds: Set<string>;
}

export function LearningTree({ scenarios, completedScenarioIds }: LearningTreeProps) {
    // Determine status for each scenario
    const scenariosWithStatus = useMemo(() => {
        return scenarios.map(scenario => {
            const isCompleted = completedScenarioIds.has(scenario.id);
            const prerequisites = scenario.prerequisites || [];

            // Unlocked if it's the root (no prerequisites) or ALL prerequisites are completed
            const isUnlocked = prerequisites.length === 0 ||
                prerequisites.every((p: any) => completedScenarioIds.has(p.id));

            // Track missing prerequisites (titles)
            const missingPrerequisites = prerequisites
                .filter((p: any) => !completedScenarioIds.has(p.id))
                .map((p: any) => p.title);

            let status: "locked" | "available" | "completed" = "locked";
            if (isCompleted) status = "completed";
            else if (isUnlocked) status = "available";

            return { ...scenario, status, missingPrerequisites };
        });
    }, [scenarios, completedScenarioIds]);

    // Calculate connections for SVG
    const connections = useMemo(() => {
        const lines: any[] = [];
        scenariosWithStatus.forEach(scenario => {
            if (scenario.unlocks) {
                scenario.unlocks.forEach((unlock: any) => {
                    const target = scenariosWithStatus.find(s => s.id === unlock.id);
                    if (target) {
                        lines.push({
                            x1: scenario.x,
                            y1: scenario.y * 10, // centered
                            x2: target.x,
                            y2: target.y * 10,
                            status: scenario.status === "completed" ? "active" : "inactive"
                        });
                    }
                });
            }
        });
        return lines;
    }, [scenariosWithStatus]);

    // Calculate dynamic container height based on max Y coordinate
    const containerHeight = useMemo(() => {
        if (scenarios.length === 0) return 1000;
        const maxY = Math.max(...scenarios.map(s => s.y));
        // y is multiplied by 10 in positioning, add extra for labels and padding
        return Math.max(1000, (maxY * 10) + 200);
    }, [scenarios]);

    return (
        <div
            className="relative w-full max-w-5xl mx-auto py-0 px-4 overflow-visible bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] rounded-[3rem] border border-[#E8E1D5]/50 shadow-inner"
            style={{ minHeight: `${containerHeight}px` }}
        >
            {/* SVG Connections Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orientation="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#E8E1D5" />
                    </marker>
                    <marker id="arrow-active" markerWidth="10" markerHeight="10" refX="8" refY="3" orientation="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#C41E3A" />
                    </marker>
                </defs>
                {connections.map((line, i) => (
                    <line
                        key={i}
                        x1={`${line.x1}%`}
                        y1={`${line.y1}px`}
                        x2={`${line.x2}%`}
                        y2={`${line.y2}px`}
                        stroke={line.status === "active" ? "#C41E3A" : "#E8E1D5"}
                        strokeWidth={line.status === "active" ? "4" : "2"}
                        strokeDasharray={line.status === "active" ? "0" : "8,8"}
                        className="transition-all duration-1000"
                    />
                ))}
            </svg>

            {/* Nodes Layer */}
            <div className="relative w-full h-full">
                {scenariosWithStatus.map((scenario) => (
                    <TreeNode
                        key={scenario.id}
                        scenario={scenario}
                        status={scenario.status}
                    />
                ))}
            </div>
        </div>
    );
}
