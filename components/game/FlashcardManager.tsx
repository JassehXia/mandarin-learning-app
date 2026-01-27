"use client";

import { useState } from "react";
import { Trash2, BookOpen, Volume2, GraduationCap, Brain, FolderPlus, Folder, MoreVertical, MoveHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { deleteFlashcard, createFolder, deleteFolder, moveFlashcardToFolder } from "@/actions/flashcards";
import { useRouter } from "next/navigation";
import { AddFlashcardDialog } from "./AddFlashcardDialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Flashcard {
    id: string;
    hanzi: string;
    pinyin: string;
    meaning: string;
    explanation?: string | null;
    folderId?: string | null;
}

interface FolderType {
    id: string;
    name: string;
    _count?: {
        flashcards: number;
    };
}

interface FlashcardManagerProps {
    flashcards: Flashcard[];
    folders: FolderType[];
}

export function FlashcardManager({ flashcards, folders }: FlashcardManagerProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState("");
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteFlashcard(id);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete flashcard:", error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        setIsCreatingFolder(true);
        try {
            await createFolder(newFolderName);
            setNewFolderName("");
            setIsCreateFolderOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Failed to create folder:", error);
        } finally {
            setIsCreatingFolder(false);
        }
    };

    const handleDeleteFolder = async (id: string) => {
        if (!confirm("Are you sure you want to delete this folder? Flashcards will not be deleted.")) return;
        try {
            await deleteFolder(id);
            if (selectedFolderId === id) setSelectedFolderId(null);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete folder:", error);
        }
    };

    const handleMoveToFolder = async (flashcardId: string, folderId: string | null) => {
        try {
            await moveFlashcardToFolder(flashcardId, folderId);
            router.refresh();
        } catch (error) {
            console.error("Failed to move flashcard:", error);
        }
    };

    const playAudio = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang.includes('zh-CN')) || voices.find(v => v.lang.includes('zh'));
        if (zhVoice) utterance.voice = zhVoice;
        window.speechSynthesis.speak(utterance);
    };

    const filteredFlashcards = selectedFolderId
        ? flashcards.filter(card => card.folderId === selectedFolderId)
        : flashcards;

    return (
        <div className="space-y-8">
            {/* Folders Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-white/40 p-3 rounded-2xl border border-[#EAD0A8]/30 overflow-x-auto">
                <Button
                    variant={selectedFolderId === null ? "default" : "ghost"}
                    onClick={() => setSelectedFolderId(null)}
                    className={`rounded-xl h-10 px-4 whitespace-nowrap ${selectedFolderId === null ? "bg-[#C41E3A] hover:bg-[#A01830] text-white" : "text-[#5C4B3A] hover:bg-[#C41E3A]/5"}`}
                >
                    All Cards ({flashcards.length})
                </Button>

                {folders.map(folder => (
                    <div key={folder.id} className="relative group">
                        <Button
                            variant={selectedFolderId === folder.id ? "default" : "ghost"}
                            onClick={() => setSelectedFolderId(folder.id)}
                            className={`rounded-xl h-10 px-4 flex items-center gap-2 whitespace-nowrap ${selectedFolderId === folder.id ? "bg-[#C41E3A] hover:bg-[#A01830] text-white" : "text-[#5C4B3A] hover:bg-[#C41E3A]/5"}`}
                        >
                            <Folder className="w-4 h-4" />
                            {folder.name} ({folder._count?.flashcards || 0})
                        </Button>
                        {selectedFolderId === folder.id && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFolder(folder.id);
                                }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                ))}

                <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" className="rounded-xl h-10 px-4 text-[#C41E3A] hover:bg-[#C41E3A]/5 gap-2">
                            <FolderPlus className="w-4 h-4" /> New Folder
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-[#FDFBF7] border-2 border-[#EAD0A8] rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-serif font-black text-[#C41E3A]">Create Folder</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateFolder} className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="folderName" className="text-[#5C4B3A] font-bold">Folder Name</Label>
                                <Input
                                    id="folderName"
                                    placeholder="e.g., Food & Drinks"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    required
                                    className="bg-white/50 border-[#EAD0A8] focus:border-[#C41E3A] focus:ring-[#C41E3A] rounded-xl h-12"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={isCreatingFolder}
                                    className="w-full bg-[#D4AF37] hover:bg-[#B89830] text-white font-bold h-12 rounded-xl"
                                >
                                    {isCreatingFolder ? "Creating..." : "Create Folder"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 p-6 rounded-3xl border-2 border-[#EAD0A8]/30 backdrop-blur-sm">
                <div>
                    <h2 className="text-2xl font-serif font-black text-[#5C4B3A]">
                        {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : "Your Collection"}
                    </h2>
                    <p className="text-[#8A7E72] font-medium">You have {filteredFlashcards.length} cards here.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <AddFlashcardDialog folders={folders} defaultFolderId={selectedFolderId || undefined} />
                    {filteredFlashcards.length >= 4 && (
                        <>
                            <Button
                                onClick={() => router.push(`/review?mode=quiz${selectedFolderId ? `&folderId=${selectedFolderId}` : ''}`)}
                                className="bg-[#D4AF37] hover:bg-[#B89830] text-white rounded-xl h-12 px-6 shadow-lg border-b-4 border-[#A6892C] transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:border-b-0"
                            >
                                <GraduationCap className="w-5 h-5 mr-2" /> Quiz Mode
                            </Button>
                            <Button
                                onClick={() => router.push(`/review?mode=learning${selectedFolderId ? `&folderId=${selectedFolderId}` : ''}`)}
                                className="bg-[#C41E3A] hover:bg-[#A01830] text-white rounded-xl h-12 px-6 shadow-lg border-b-4 border-[#801326] transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:border-b-0"
                            >
                                <Brain className="w-5 h-5 mr-2" /> Learning Mode
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {filteredFlashcards.length === 0 ? (
                <div className="text-center py-20 bg-white/20 rounded-3xl border-2 border-dashed border-[#EAD0A8]">
                    <div className="w-20 h-20 bg-[#EAD0A8]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-[#8A7E72]" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#5C4B3A] mb-2">No flashcards here</h3>
                    <p className="text-[#8A7E72] mb-8">Add some words to this folder!</p>
                    <AddFlashcardDialog folders={folders} defaultFolderId={selectedFolderId || undefined} />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredFlashcards.map((card) => (
                            <motion.div
                                key={card.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="group bg-white border-2 border-[#EAD0A8] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FDFBF7] rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500" />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-4xl font-bold text-[#2C2C2C] font-serif mb-1 group-hover:text-[#C41E3A] transition-colors">
                                                    {card.hanzi}
                                                </h3>
                                                <p className="text-sm text-[#C41E3A] font-bold italic">{card.pinyin}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-[#8A7E72] hover:text-[#C41E3A] hover:bg-[#C41E3A]/5">
                                                            <MoreVertical className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-[#FDFBF7] border-[#EAD0A8] rounded-xl">
                                                        <DropdownMenuItem onClick={() => playAudio(card.hanzi)} className="gap-2">
                                                            <Volume2 className="h-4 h-4" /> Play Audio
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="my-1 border-t border-[#EAD0A8]" />
                                                        <div className="px-2 py-1.5 text-xs font-bold text-[#8A7E72] uppercase tracking-wider">Move to Folder</div>
                                                        <DropdownMenuItem onClick={() => handleMoveToFolder(card.id, null)} className="gap-2">
                                                            <MoveHorizontal className="h-4 w-4" /> None (Ungrouped)
                                                        </DropdownMenuItem>
                                                        {folders.map(f => (
                                                            <DropdownMenuItem
                                                                key={f.id}
                                                                onClick={() => handleMoveToFolder(card.id, f.id)}
                                                                className="gap-2"
                                                                disabled={card.folderId === f.id}
                                                            >
                                                                <Folder className="h-4 w-4" /> {f.name}
                                                            </DropdownMenuItem>
                                                        ))}
                                                        <DropdownMenuSeparator className="my-1 border-t border-[#EAD0A8]" />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(card.id)}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
                                                            disabled={deletingId === card.id}
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Delete Card
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EAD0A8]/50">
                                                <span className="text-xs font-bold uppercase tracking-widest text-[#8A7E72] block mb-1">Meaning</span>
                                                <p className="text-[#5C4B3A] font-medium leading-tight">{card.meaning}</p>
                                            </div>

                                            {card.explanation && (
                                                <div className="px-1">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-[#8A7E72] block mb-1">Note</span>
                                                    <p className="text-[#8A7E72] text-sm leading-relaxed">{card.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

