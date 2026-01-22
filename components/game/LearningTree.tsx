"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { TreeNode } from "./TreeNode";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LearningTreeProps {
    scenarios: any[];
    completedScenarioIds: Set<string>;
}

export function LearningTree({ scenarios, completedScenarioIds }: LearningTreeProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // Vertical offset to ensure top nodes/popups aren't covered
    const BASE_Y_OFFSET = 120;

    // Determine status and coordinates for each scenario
    const scenariosWithStatus = useMemo(() => {
        return scenarios.map(scenario => {
            const isCompleted = completedScenarioIds.has(scenario.id);
            const prerequisites = scenario.prerequisites || [];

            const isUnlocked = prerequisites.length === 0 ||
                prerequisites.every((p: any) => completedScenarioIds.has(p.id));

            const missingPrerequisites = prerequisites
                .filter((p: any) => !completedScenarioIds.has(p.id))
                .map((p: any) => p.title);

            let status: "locked" | "available" | "completed" = "locked";
            if (isCompleted) status = "completed";
            else if (isUnlocked) status = "available";

            return {
                ...scenario,
                status,
                missingPrerequisites,
                // Unified display coordinates
                displayX: `${scenario.x}%`,
                displayY: `${(scenario.y * 10) + BASE_Y_OFFSET}px`
            };
        });
    }, [scenarios, completedScenarioIds]);

    // Calculate connections for SVG using the unified display coordinates
    const connections = useMemo(() => {
        const lines: any[] = [];
        scenariosWithStatus.forEach(scenario => {
            if (scenario.unlocks) {
                scenario.unlocks.forEach((unlock: any) => {
                    const target = scenariosWithStatus.find(s => s.id === unlock.id);
                    if (target) {
                        lines.push({
                            x1: scenario.displayX,
                            y1: scenario.displayY,
                            x2: target.displayX,
                            y2: target.displayY,
                            status: scenario.status === "completed" ? "active" : "inactive"
                        });
                    }
                });
            }
        });
        return lines;
    }, [scenariosWithStatus]);

    // Calculate dynamic height based on scenarios and offset
    const contentHeight = useMemo(() => {
        if (scenarios.length === 0) return 1000;
        const maxY = Math.max(...scenarios.map(s => s.y));
        return (maxY * 10) + BASE_Y_OFFSET + 400; // Large bottom buffer
    }, [scenarios]);

    const handleZoom = (delta: number) => {
        setScale(prev => Math.min(Math.max(prev + delta, 0.4), 1.5));
    };

    const resetView = () => {
        setScale(1);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Center content horizontally on mount
    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
        }
    }, [scenarios]);

    return (
        <div className="relative w-full h-full overflow-hidden rounded-[3rem] border border-[#E8E1D5]/50 shadow-inner bg-[#FDFBF7]">
            {/* Viewport controls */}
            <div className="absolute top-6 right-6 z-50 flex flex-col gap-2">
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleZoom(0.1)}
                    className="bg-white/80 backdrop-blur-sm border-[#E8E1D5] hover:bg-white text-[#C41E3A] shadow-lg rounded-xl"
                >
                    <ZoomIn className="w-5 h-5" />
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleZoom(-0.1)}
                    className="bg-white/80 backdrop-blur-sm border-[#E8E1D5] hover:bg-white text-[#C41E3A] shadow-lg rounded-xl"
                >
                    <ZoomOut className="w-5 h-5" />
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={resetView}
                    className="bg-white/80 backdrop-blur-sm border-[#E8E1D5] hover:bg-white text-[#C41E3A] shadow-lg rounded-xl"
                >
                    <RefreshCw className="w-5 h-5" />
                </Button>
            </div>

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="w-full h-full overflow-auto scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
            >
                <div
                    className="relative transition-transform duration-300 ease-out origin-top"
                    style={{
                        height: `${contentHeight}px`,
                        width: '100%',
                        minWidth: '800px', // Robust base width for horizontal spread
                        transform: `scale(${scale})`
                    }}
                >
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#C41E3A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                    {/* SVG Connections - Using synchronized coordinates */}
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
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                stroke={line.status === "active" ? "#C41E3A" : "#E8E1D5"}
                                strokeWidth={line.status === "active" ? "4" : "2"}
                                strokeDasharray={line.status === "active" ? "0" : "8,8"}
                                style={{ vectorEffect: "non-scaling-stroke" }}
                                className="transition-all duration-1000"
                            />
                        ))}
                    </svg>

                    {/* Nodes - Positioned using the same coordinates as SVG */}
                    <div className="relative w-full h-full">
                        {scenariosWithStatus.map((scenario) => (
                            <div
                                key={scenario.id}
                                className="absolute -translate-x-1/2 -translate-y-1/2"
                                style={{ left: scenario.displayX, top: scenario.displayY }}
                            >
                                <TreeNode
                                    scenario={scenario}
                                    status={scenario.status}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Subtle Gradient Shadows */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#FDFBF7] to-transparent pointer-events-none z-10 opacity-50" />
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FDFBF7] to-transparent pointer-events-none z-10 opacity-50" />
        </div>
    );
}
