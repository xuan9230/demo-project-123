import { motion } from "framer-motion";
import { AlertTriangleIcon, HelpCircleIcon, ClockIcon } from "lucide-react";
import { useRef } from "react";

export default function ProblemStatement() {
    const refs = useRef([]);

    const painPoints = [
        {
            icon: AlertTriangleIcon,
            title: "Hidden History",
            description: "Odometer tampering, undisclosed accidents, and finance owing — traditional listings leave you in the dark about a vehicle's true past.",
        },
        {
            icon: HelpCircleIcon,
            title: "Pricing Guesswork",
            description: "Without accurate market data, buyers overpay and sellers undervalue. It's a guessing game that costs everyone money.",
        },
        {
            icon: ClockIcon,
            title: "Tedious Listings",
            description: "Selling a car means endless forms, manual photo uploads, and writing descriptions from scratch. It's time-consuming and frustrating.",
        },
    ];

    return (
        <motion.section className="mt-32"
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 70, mass: 1 }}
        >
            <div className="text-center">
                <motion.h2 className="text-3xl font-semibold max-w-2xl mx-auto mt-4 text-white"
                    initial={{ y: 120, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    Buying or Selling a Used Car Shouldn't Be This Hard
                </motion.h2>
                <motion.p className="mt-4 text-center text-sm/7 text-gray-100 max-w-md mx-auto"
                    initial={{ y: 120, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                >
                    The current used car market in New Zealand is broken. Here's what you're up against.
                </motion.p>
            </div>

            <div className="flex flex-wrap items-stretch justify-center gap-6 mt-10 px-6">
                {painPoints.map((point, index) => (
                    <motion.div
                        key={index}
                        ref={(el) => (refs.current[index] = el)}
                        className="hover:-translate-y-0.5 p-6 rounded-xl space-y-4 glass max-w-80 w-full border-orange-500/20"
                        initial={{ y: 150, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                            delay: index * 0.15,
                            type: "spring",
                            stiffness: 320,
                            damping: 70,
                            mass: 1
                        }}
                        onAnimationComplete={() => {
                            const card = refs.current[index];
                            if (card) {
                                card.classList.add("transition", "duration-300");
                            }
                        }}
                    >
                        <point.icon className="size-8.5 text-orange-500" />
                        <h3 className="text-base font-medium text-white">
                            {point.title}
                        </h3>
                        <p className="text-gray-100 pb-2">
                            {point.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
