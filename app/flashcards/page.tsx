import { getUserFlashcards } from "@/actions/flashcards";
import { FlashcardManager } from "@/components/game/FlashcardManager";
import { getOrCreateUser } from "@/lib/auth-util";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookMarked } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
    const user = await getOrCreateUser();

    if (!user) {
        redirect("/");
    }

    const flashcards = await getUserFlashcards();

    return (
        <main className="min-h-screen bg-[#FDFBF7] py-12 md:py-20">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-12 flex items-center justify-between">
                        <div>
                            <Link href="/stages">
                                <Button variant="ghost" className="text-[#8A7E72] hover:text-[#C41E3A] mb-4 -ml-4">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Stages
                                </Button>
                            </Link>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#C41E3A]/10 rounded-2xl transform -rotate-6">
                                    <BookMarked className="w-7 h-7 text-[#C41E3A] transform rotate-6" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-serif font-black text-[#2C2C2C] tracking-tight">
                                    My <span className="text-[#C41E3A]">Flashcards</span>
                                </h1>
                            </div>
                            <p className="text-[#5C4B3A] text-lg font-medium">
                                Build your personal vocabulary collection
                            </p>
                        </div>
                    </div>

                    <FlashcardManager flashcards={flashcards} />
                </div>
            </div>
        </main>
    );
}
