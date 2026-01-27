"use client";

import Link from "next/link";
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, LayoutDashboard, Languages, Compass } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    const navLinks = [
        { href: "/", label: "Home", icon: Home, public: true },
        { href: "/stages", label: "Your Journey", icon: Compass, public: true },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, public: true },
        { href: "/flashcards", label: "Flashcards", icon: Languages, public: true },
    ];

    return (
        <>
            <header className="sticky top-0 z-[60] w-full border-b border-[#E8E1D5] bg-[#FDFBF7]/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-serif font-bold text-[#C41E3A] tracking-tight">StreetLevel</span>
                        <span className="text-xs font-medium text-[#D4AF37] uppercase tracking-widest hidden sm:inline-block">Mandarin</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            (!link.public) ? (
                                <SignedIn key={link.href}>
                                    <Link
                                        href={link.href}
                                        className={`text-sm font-medium transition-colors ${pathname === link.href ? "text-[#C41E3A]" : "text-[#5C4B3A] hover:text-[#C41E3A]"}`}
                                    >
                                        {link.label}
                                    </Link>
                                </SignedIn>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors ${pathname === link.href ? "text-[#C41E3A]" : "text-[#5C4B3A] hover:text-[#C41E3A]"}`}
                                >
                                    {link.label}
                                </Link>
                            )
                        ))}

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

                    {/* Mobile Menu Toggle */}
                    <div className="flex items-center gap-3 md:hidden">
                        <SignedIn>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "h-8 w-8 border-2 border-[#D4AF37]/30"
                                    }
                                }}
                            />
                        </SignedIn>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-[#5C4B3A] hover:bg-[#E8E1D5]/20 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] md:hidden"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[280px] bg-[#FDFBF7] z-[80] shadow-2xl p-6 md:hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <span className="font-serif font-bold text-xl text-[#C41E3A]">Menu</span>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-[#E8E1D5]/20 rounded-full">
                                    <X className="w-5 h-5 text-[#5C4B3A]" />
                                </button>
                            </div>

                            <nav className="flex flex-col gap-2">
                                {navLinks.map((link) => {
                                    const Icon = link.icon;
                                    const content = (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${pathname === link.href
                                                ? "bg-[#C41E3A] text-white shadow-lg"
                                                : "text-[#5C4B3A] hover:bg-[#E8E1D5]/20"
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${pathname === link.href ? "text-white" : "text-[#D4AF37]"}`} />
                                            <span className="font-bold">{link.label}</span>
                                        </Link>
                                    );

                                    return link.public ? content : <SignedIn key={link.href}>{content}</SignedIn>;
                                })}
                            </nav>

                            <div className="mt-auto pt-6 border-t border-[#E8E1D5]">
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <Button className="w-full bg-[#C41E3A] hover:bg-[#A01830] text-white py-6 rounded-xl font-bold">
                                            Sign In
                                        </Button>
                                    </SignInButton>
                                </SignedOut>
                                <SignedIn>
                                    <div className="flex items-center gap-3 p-4 bg-[#E8E1D5]/10 rounded-xl">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-[#8A7E72] uppercase tracking-wider">Account</p>
                                            <p className="text-sm font-bold text-[#5C4B3A]">Active Session</p>
                                        </div>
                                    </div>
                                </SignedIn>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
