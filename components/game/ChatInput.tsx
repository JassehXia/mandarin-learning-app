"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
    input: string;
    setInput: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    disabled: boolean;
    isLoading: boolean;
}

export function ChatInput({
    input,
    setInput,
    onSubmit,
    disabled,
    isLoading
}: ChatInputProps) {
    return (
        <div className="border-t border-[#E8E1D5] bg-white p-4 pb-6 md:pb-8">
            <form onSubmit={onSubmit} className="mx-auto flex max-w-3xl gap-4">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1 border-[#E8E1D5] bg-[#FDFBF7] text-lg h-12 focus-visible:ring-[#C41E3A]"
                    autoFocus
                    disabled={disabled}
                />
                <Button
                    type="submit"
                    size="icon"
                    className="h-12 w-12 shrink-0 bg-[#C41E3A] hover:bg-[#A01818] text-white rounded-full transition-all shadow-md hover:scale-105"
                    disabled={disabled}
                >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                </Button>
            </form>
        </div>
    );
}
