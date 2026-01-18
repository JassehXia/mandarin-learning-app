"use client";

import { motion } from "framer-motion";

const steps = [
    {
        number: "一",
        title: "Arrival",
        description: "Start your journey. The sights, sounds, and challenges of a new land await.",
    },
    {
        number: "二",
        title: "Immersion",
        description: "Navigate the streets. Find your way, find your food, find your voice.",
    },
    {
        number: "三",
        title: "Mastery",
        description: "Speak with confidence. Connect deeply with the culture and its people.",
    },
];

export function HowItWorks() {
    return (
        <section className="py-32 bg-[#C41E3A] text-[#FDFBF7] relative overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 border-[40px] border-[#D4AF37] rounded-full"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 border-[40px] border-[#D4AF37] rounded-full"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Your Path</h2>
                    <div className="w-24 h-1 bg-[#D4AF37] mx-auto opacity-50"></div>
                </div>

                <div className="relative">
                    {/* Connecting line */}
                    <div className="hidden md:block absolute top-[24%] left-[10%] w-[80%] h-px bg-[#D4AF37]/30 z-0 border-t border-dashed border-[#D4AF37]/50"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.3, duration: 0.6 }}
                                className="relative z-10 flex flex-col items-center text-center group"
                            >
                                <div className="w-24 h-24 rounded-full bg-[#A01818] border-2 border-[#D4AF37] flex items-center justify-center text-3xl font-serif font-bold text-[#D4AF37] mb-8 shadow-lg shadow-black/20 relative z-10">
                                    {step.number}
                                </div>
                                <h3 className="text-2xl font-serif font-bold mb-4 text-[#D4AF37] tracking-wide">{step.title}</h3>
                                <p className="text-[#FDFBF7]/80 max-w-xs leading-relaxed font-light">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
