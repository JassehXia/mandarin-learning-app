import { getUserFlashcards } from "@/actions/flashcards";
import { ReviewQuiz } from "@/components/game/ReviewQuiz";
import { LearningMode } from "@/components/game/LearningMode";
import { getOrCreateUser } from "@/lib/auth-util";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
    searchParams,
}: {
    searchParams: { mode?: string };
}) {
    const user = await getOrCreateUser();

    if (!user) {
        redirect("/");
    }

    const flashcards = await getUserFlashcards();
    const params = await searchParams;
    const mode = params.mode || "quiz";

    return (
        <main className="min-h-screen bg-[#FDFBF7] py-12 md:py-20">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12 flex items-center justify-between">
                        <div>
                            <Link href="/flashcards">
                                <Button variant="ghost" className="text-[#8A7E72] hover:text-[#C41E3A] mb-4 -ml-4">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Flashcards
                                </Button>
                            </Link>
                            <h1 className="text-4xl md:text-5xl font-serif font-black text-[#2C2C2C] tracking-tight">
                                <span className="text-[#C41E3A]">{mode === "learning" ? "Learning" : "Review"}</span>
                            </h1>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-[#D4AF37] font-bold text-sm uppercase tracking-widest">
                                {mode === "learning" ? "Practice Session" : "Mastery Session"}
                            </p>
                            <p className="text-[#5C4B3A] text-xs font-medium italic">
                                {mode === "learning" ? "Type to learn" : "Practice makes perfect"}
                            </p>
                        </div>
                    </div>

                    {mode === "learning" ? (
                        <LearningMode initialFlashcards={flashcards} />
                    ) : (
                        <ReviewQuiz initialFlashcards={flashcards} />
                    )}
                </div>
            </div>
        </main>
    );
}
