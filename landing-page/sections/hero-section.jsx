import { ArrowDownIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {

    return (
        <>
            <motion.div className="fixed inset-0 overflow-hidden -z-20 pointer-events-none"
                initial={{ opacity: 0.4 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <div className="absolute rounded-full top-80 left-2/5 -translate-x-1/2 size-130 bg-[#22C55E] blur-[100px]" />
                <div className="absolute rounded-full top-80 right-0 -translate-x-1/2 size-130 bg-[#1E40AF] blur-[100px]" />
                <div className="absolute rounded-full top-0 left-1/2 -translate-x-1/2 size-130 bg-[#F97316] blur-[100px]" />
            </motion.div>
            <motion.section className="flex flex-col items-center">
                <motion.div className="flex items-center gap-3 mt-32"
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    <p>New Zealand's Smarter Car Marketplace</p>
                    <span className="btn glass py-1 px-3 text-xs bg-green-500/20 text-green-400 border-green-500/30">
                        Coming Soon
                    </span>
                </motion.div>
                <motion.h1 className="text-center text-4xl/13 md:text-6xl/19 mt-4 font-semibold tracking-tight max-w-4xl"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                >
                    Buy and Sell Used Cars in New Zealand — With Confidence
                </motion.h1>
                <motion.p className="text-center text-gray-100 text-base/7 max-w-xl mt-6"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    KiwiCar combines official NZTA vehicle data with AI-powered insights to help you make smarter decisions. Know the history, get the right price, and connect with verified buyers and sellers.
                </motion.p>

                <motion.div className="flex flex-col md:flex-row max-md:w-full items-center gap-4 md:gap-3 mt-8"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    <a href="#waitlist" className="btn max-md:w-full bg-green-500 hover:bg-green-600 text-black font-medium py-3">
                        Join the Waitlist
                    </a>
                    <a href="#how-it-works" className="btn max-md:w-full glass flex items-center justify-center gap-2 py-3">
                        <ArrowDownIcon className="size-4.5" />
                        Learn How It Works
                    </a>
                </motion.div>
            </motion.section>
        </>
    );
}
