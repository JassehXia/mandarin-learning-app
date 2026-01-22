"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface MistakeAnalysisProps {
    mistakes: Record<string, number>;
}

export function MistakeAnalysis({ mistakes }: MistakeAnalysisProps) {
    const total = Object.values(mistakes).reduce((acc, val) => acc + val, 0);

    const categories = [
        { name: "Grammar", color: "bg-blue-500" },
        { name: "Word Choice", color: "bg-orange-500" },
        { name: "Spelling", color: "bg-red-500" },
        { name: "Other", color: "bg-gray-400" }
    ];

    return (
        <Card className="border-[#E8E1D5] bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-[#2D241E] text-white py-4">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#D4AF37]" />
                    <CardTitle className="text-lg font-serif font-bold">Today's Mistake Analysis</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {total === 0 ? (
                    <div className="text-center py-8 text-[#8C7A66] font-medium italic">
                        No mistakes captured today yet. Perfect score!
                    </div>
                ) : (
                    <div className="space-y-5">
                        {categories.map((cat) => {
                            const count = mistakes[cat.name] || 0;
                            const percent = total > 0 ? Math.round((count / total) * 100) : 0;

                            return (
                                <div key={cat.name} className="space-y-1.5">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-[#5C4B3A]">{cat.name}</span>
                                        <span className="text-xs font-black text-[#8C7A66]">{count} ({percent}%)</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-[#F5F1EA] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${cat.color} rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
