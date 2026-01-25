import SectionTitle from "@/components/section-title";
import { SearchIcon, DollarSignIcon, ClockIcon, BellIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function Features() {

    const refs = useRef([]);

    const featuresData = [
        {
            icon: SearchIcon,
            title: "Instant Vehicle History",
            description: "Enter any plate to see WoF history, odometer readings, and damage reports from NZTA.",
        },
        {
            icon: DollarSignIcon,
            title: "AI-Powered Pricing",
            description: "Get accurate market valuations based on thousands of real listings.",
        },
        {
            icon: ClockIcon,
            title: "List in 60 Seconds",
            description: "Enter your plate, add photos, and let AI write your listing.",
        },
        {
            icon: BellIcon,
            title: "Smart Alerts",
            description: "Get notified when cars matching your criteria hit the market.",
        },
    ];

    return (
        <section className="mt-32" id="features">
            <SectionTitle
                title="A Smarter Way to Trade Cars"
                description="KiwiCar brings transparency, speed, and intelligence to New Zealand's used car market."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 px-6 max-w-4xl mx-auto">
                {featuresData.map((feature, index) => (
                    <motion.div
                        key={index}
                        ref={(el) => (refs.current[index] = el)}
                        className="hover:-translate-y-0.5 p-6 rounded-xl space-y-4 glass w-full"
                        initial={{ y: 150, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                            delay: index * 0.1,
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
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-500/20">
                            <feature.icon className="size-6 text-green-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white">
                            {feature.title}
                        </h3>
                        <p className="text-gray-100 pb-2">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
