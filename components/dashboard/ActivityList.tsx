import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
    id: string;
    scenarioTitle: string;
    status: string;
    score: number | null;
    date: string;
}

interface ActivityListProps {
    activities: Activity[];
}

export function ActivityList({ activities }: ActivityListProps) {
    return (
        <Card className="border-[#E8E1D5] bg-white/50 backdrop-blur-sm shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-serif font-bold text-[#2D241E] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#D4AF37]" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <p className="text-center py-6 text-stone-500 italic">No recent activity found. Start a conversation!</p>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#F0EBE0] group hover:border-[#D4AF37] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${activity.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                                            activity.status === 'FAILED' ? 'bg-red-50 text-red-600' :
                                                'bg-blue-50 text-blue-600'
                                        }`}>
                                        {activity.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> :
                                            activity.status === 'FAILED' ? <XCircle className="w-5 h-5" /> :
                                                <Clock className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#2D241E]">{activity.scenarioTitle}</h4>
                                        <p className="text-xs text-[#8C7A66]">
                                            {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                {activity.score !== null && (
                                    <div className="flex items-center gap-1 bg-[#FDFBF7] px-3 py-1 rounded-full border border-[#E8E1D5]">
                                        <Trophy className="w-3 h-3 text-[#D4AF37]" />
                                        <span className="text-sm font-bold text-[#2D241E]">{activity.score}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
