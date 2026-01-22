import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
    };
    color?: string;
}

export function StatsCard({ title, value, description, icon: Icon, trend, color = "text-[#C41E3A]" }: StatsCardProps) {
    return (
        <Card className="border-[#E8E1D5] bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold text-[#5C4B3A] uppercase tracking-wider">{title}</CardTitle>
                <div className={`p-2 rounded-xl bg-white shadow-inner ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-serif font-black text-[#2D241E]">{value}</div>
                {description && (
                    <p className="text-xs font-medium text-[#8C7A66] mt-1">
                        {description}
                    </p>
                )}
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        <span className={`text-xs font-bold ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {trend.value > 0 ? '+' : ''}{trend.value}%
                        </span>
                        <span className="text-[10px] text-[#8C7A66]">{trend.label}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
