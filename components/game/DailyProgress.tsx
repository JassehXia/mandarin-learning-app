import { Zap } from "lucide-react";

interface DailyProgressProps {
    goalPercent: number;
}

export function DailyProgress({ goalPercent }: DailyProgressProps) {
    return (
        <div className="bg-white rounded-3xl p-8 border border-[#E8E1D5] shadow-sm">
            <h3 className="text-xl font-serif font-bold text-[#2D241E] mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#C41E3A]" />
                Daily Goal
            </h3>

            <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                    <div>
                        <span className="text-xs font-bold inline-block py-1 px-2 uppercase rounded-full text-[#C41E3A] bg-[#C41E3A]/10">
                            {goalPercent === 100 ? 'Complete' : 'In Progress'}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-black text-[#2D241E]">
                            {goalPercent}%
                        </span>
                    </div>
                </div>
                <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-[#FDFBF7] border border-[#E8E1D5] shadow-inner">
                    <div
                        style={{ width: `${goalPercent}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#C41E3A] to-[#D4AF37] transition-all duration-1000"
                    ></div>
                </div>
                <p className="text-sm text-[#8C7A66] font-medium leading-relaxed">
                    Complete 3 scenarios daily to build lasting memory. You're doing great!
                </p>
            </div>
        </div>
    );
}
