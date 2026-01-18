"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#C41E3A]">
            {/* CSS Pattern Background - Traditional Clouds/Waves motif */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent" />
                <div className="h-full w-full" style={{
                    backgroundImage: `radial-gradient(circle at 20px 20px, #D4AF37 2px, transparent 2.5px)`,
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            {/* Decorative Border Frame */}
            <div className="absolute inset-4 border-2 border-[#D4AF37]/30 rounded-3xl pointer-events-none z-20"></div>
            <div className="absolute inset-6 border border-[#D4AF37]/20 rounded-2xl pointer-events-none z-20"></div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center text-[#FDFBF7]">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="mb-6 inline-block">
                        <div className="flex items-center justify-center gap-3">
                            <span className="h-px w-12 bg-[#D4AF37]/60"></span>
                            <span className="text-sm font-medium tracking-[0.2em] uppercase text-[#D4AF37]">Immersive Journey</span>
                            <span className="h-px w-12 bg-[#D4AF37]/60"></span>
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-serif font-bold tracking-tight mb-8 drop-shadow-sm text-[#FDFBF7]">
                        Learn Mandarin <br />
                        <span className="italic text-[#D4AF37]">By Living It</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-[#FDFBF7]/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        Step into a world of <span className="text-[#D4AF37] font-serif">culture</span> and conversation.
                        Navigate real scenarios, from bustling markets to quiet tea houses.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Button size="lg" className="bg-[#D4AF37] hover:bg-[#B5952F] text-[#C41E3A] font-bold text-lg px-10 py-7 h-auto shadow-lg hover:shadow-[#D4AF37]/20 transition-all hover:-translate-y-1 rounded-full">
                            Start Your Journey
                        </Button>
                        <Button size="lg" variant="outline" className="border-[#FDFBF7]/40 text-[#FDFBF7] hover:bg-[#FDFBF7]/10 font-medium text-lg px-10 py-7 h-auto rounded-full">
                            View Demo
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
