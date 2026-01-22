"use client";

import Link from "next/link";
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#E8E1D5] bg-[#FDFBF7]/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-serif font-bold text-[#C41E3A] tracking-tight">StreetLevel</span>
                    <span className="text-xs font-medium text-[#D4AF37] uppercase tracking-widest hidden sm:inline-block">Mandarin</span>
                </Link>

                <nav className="flex items-center gap-6">
                    <SignedIn>
                        <Link href="/dashboard" className="text-sm font-medium text-[#5C4B3A] hover:text-[#C41E3A] transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/flashcards" className="text-sm font-medium text-[#5C4B3A] hover:text-[#C41E3A] transition-colors">
                            Flashcards
                        </Link>
                    </SignedIn>

                    <Link href="/stages" className="text-sm font-medium text-[#5C4B3A] hover:text-[#C41E3A] transition-colors">
                        Your Journey
                    </Link>

                    <div className="h-4 w-px bg-[#E8E1D5]"></div>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="ghost" className="text-sm font-bold text-[#C41E3A] hover:text-[#A01830] hover:bg-[#C41E3A]/5">
                                Sign In
                            </Button>
                        </SignInButton>
                    </SignedOut>

                    <SignedIn>
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "h-9 w-9 border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all"
                                }
                            }}
                        />
                    </SignedIn>
                </nav>
            </div>
        </header>
    );
}
