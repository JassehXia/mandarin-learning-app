"use client";

import { motion } from "framer-motion";
import { MessageCircle, Map, BookOpen } from "lucide-react";

const features = [
    {
        icon: <MessageCircle className="h-8 w-8 text-[#C41E3A]" />,
        title: "Authentic Dialogues",
        description: "Chat with personalities that carry the wisdom and wit of locals. Master the nuance of tone.",
    },
    {
        icon: <Map className="h-8 w-8 text-[#C41E3A]" />,
        title: "Navigate Daily Life",
        description: "Order steaming dumplings, hail a taxi in the rain, or bargain at the night market.",
    },
    {
        icon: <BookOpen className="h-8 w-8 text-[#C41E3A]" />,
        title: "Cultural Mastery",
        description: "Language is culture. Learn etiquette, history, and the unspoken rules of interaction.",
    },
];

export function Features() {
    return (
        <section className="py-32 bg-[#FDFBF7] text-[#2C2C2C]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-[#C41E3A]">More Than Just Words</h2>
                    <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
                    <p className="text-[#5C4B3A] text-xl max-w-2xl mx-auto font-light">
                        Traditional learning focuses on vocabulary. We focus on connection.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            className="group p-10 bg-white border border-[#E8E1D5] hover:border-[#D4AF37] transition-all duration-500 shadow-sm hover:shadow-xl relative overflow-hidden"
                        >
                            {/* Decorative Corner Knot */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#C41E3A]/5 -mr-8 -mt-8 rotate-45 transform group-hover:bg-[#C41E3A]/10 transition-colors"></div>

                            <div className="mb-8 p-4 rounded-full bg-[#FDFBF7] inline-block border border-[#E8E1D5] group-hover:border-[#D4AF37] transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-serif font-bold mb-4 text-[#2C2C2C]">{feature.title}</h3>
                            <p className="text-[#5C4B3A] leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
