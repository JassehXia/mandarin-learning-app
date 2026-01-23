"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveFlashcard } from "@/actions/flashcards";
import { convertToToneMarks } from "@/lib/pinyin-input-util";
import { useRouter } from "next/navigation";

interface AddFlashcardDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialData?: {
        hanzi: string;
        pinyin: string;
        meaning: string;
    } | null;
    trigger?: React.ReactNode;
}

export function AddFlashcardDialog({
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    initialData,
    trigger
}: AddFlashcardDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

    const [formData, setFormData] = useState({
        hanzi: "",
        pinyin: "",
        meaning: "",
        explanation: "",
    });

    useEffect(() => {
        if (initialData && open) {
            setFormData({
                hanzi: initialData.hanzi || "",
                pinyin: initialData.pinyin || "",
                meaning: initialData.meaning || "",
                explanation: "",
            });
        }
    }, [initialData, open]);

    const handlePinyinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            pinyin: convertToToneMarks(value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await saveFlashcard(formData);
            setOpen(false);
            setFormData({ hanzi: "", pinyin: "", meaning: "", explanation: "" });
            router.refresh();
        } catch (error) {
            console.error("Failed to save flashcard:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            ) : (
                controlledOpen === undefined && (
                    <DialogTrigger asChild>
                        <Button className="bg-[#C41E3A] hover:bg-[#A01830] text-white rounded-xl h-12 px-6 shadow-lg border-b-4 border-[#801326] transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:border-b-0">
                            <Plus className="w-5 h-5 mr-2" /> Add Flashcard
                        </Button>
                    </DialogTrigger>
                )
            )}
            <DialogContent className="sm:max-w-[425px] bg-[#FDFBF7] border-2 border-[#EAD0A8] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif font-black text-[#C41E3A]">
                        {initialData ? "Quick Flashcard" : "New Flashcard"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="hanzi" className="text-[#5C4B3A] font-bold">Chinese (Hanzi)</Label>
                        <Input
                            id="hanzi"
                            placeholder="你好"
                            value={formData.hanzi}
                            onChange={(e) => setFormData({ ...formData, hanzi: e.target.value })}
                            required
                            className="bg-white/50 border-[#EAD0A8] focus:border-[#C41E3A] focus:ring-[#C41E3A] rounded-xl h-12 text-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pinyin" className="text-[#5C4B3A] font-bold">Pinyin (e.g., ni3 hao3)</Label>
                        <Input
                            id="pinyin"
                            placeholder="nǐ hǎo"
                            value={formData.pinyin}
                            onChange={handlePinyinChange}
                            required
                            className="bg-white/50 border-[#EAD0A8] focus:border-[#C41E3A] focus:ring-[#C41E3A] rounded-xl h-12 text-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meaning" className="text-[#5C4B3A] font-bold">Meaning</Label>
                        <Input
                            id="meaning"
                            placeholder="Hello"
                            value={formData.meaning}
                            onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                            required
                            className="bg-white/50 border-[#EAD0A8] focus:border-[#C41E3A] focus:ring-[#C41E3A] rounded-xl h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="explanation" className="text-[#5C4B3A] font-bold">Explanation (Optional)</Label>
                        <Textarea
                            id="explanation"
                            placeholder="Common greeting..."
                            value={formData.explanation}
                            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                            className="bg-white/50 border-[#EAD0A8] focus:border-[#C41E3A] focus:ring-[#C41E3A] rounded-xl min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#D4AF37] hover:bg-[#B89830] text-white font-bold h-12 rounded-xl shadow-md border-b-4 border-[#A6892C] transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:border-b-0"
                        >
                            {loading ? "Adding..." : "Add to Deck"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
