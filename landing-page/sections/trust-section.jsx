import SectionTitle from "@/components/section-title";
import { motion } from "framer-motion";
import { useRef } from "react";
import { ShieldCheckIcon, LockIcon, FileTextIcon } from "lucide-react";

export default function TrustSection() {
    const ref = useRef([]);

    const trustBadges = [
        {
            icon: ShieldCheckIcon,
            title: "Official NZTA Data",
            description: "All vehicle information comes directly from the New Zealand Transport Agency database.",
        },
        {
            icon: LockIcon,
            title: "Secure & Encrypted",
            description: "Your personal data is protected with bank-grade encryption and never shared with third parties.",
        },
        {
            icon: FileTextIcon,
            title: "NZ Privacy Act Compliant",
            description: "We operate fully within New Zealand's Privacy Act 2020 requirements.",
        },
    ];

    const testimonials = [
        {
            review: "Finally, a car marketplace that gives me the full picture. I could see the exact WoF history and odometer readings before even contacting the seller. Saved me from a dodgy deal!",
            name: "Sarah Mitchell",
            location: "Auckland",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
        },
        {
            review: "Listed my car in literally 2 minutes. Just entered my plate, uploaded a few photos, and the AI wrote a better description than I ever could. Sold within a week!",
            name: "James Thompson",
            location: "Wellington",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
        },
    ];

    return (
        <section className="mt-32 flex flex-col items-center">
            <SectionTitle
                title="Built on Official Data You Can Trust"
                description="KiwiCar sources data directly from authoritative New Zealand databases to ensure accuracy and transparency."
            />

            <div className="flex flex-wrap items-stretch justify-center gap-6 mt-10 px-6">
                {trustBadges.map((badge, index) => (
                    <motion.div
                        key={index}
                        className="p-6 rounded-xl space-y-4 glass max-w-72 w-full text-center hover:-translate-y-0.5"
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
                    >
                        <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-blue-700/20">
                            <badge.icon className="size-7 text-blue-400" />
                        </div>
                        <h3 className="text-base font-medium text-white">
                            {badge.title}
                        </h3>
                        <p className="text-gray-100 text-sm">
                            {badge.description}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-16 w-full max-w-4xl px-6">
                <h3 className="text-xl font-semibold text-center mb-8">What Early Access Users Say</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            className='w-full space-y-5 rounded-lg glass p-6 hover:-translate-y-1'
                            initial={{ y: 150, opacity: 0 }}
                            ref={(el) => (ref.current[index] = el)}
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
                                const card = ref.current[index];
                                if (card) {
                                    card.classList.add("transition", "duration-300");
                                }
                            }}
                        >
                            <div className='flex items-center gap-4'>
                                <img className='size-12 rounded-full object-cover' src={item.image} alt={item.name} />
                                <div>
                                    <p className="font-medium text-white">{item.name}</p>
                                    <p className="text-sm text-gray-400">{item.location}</p>
                                </div>
                            </div>
                            <p className='text-gray-100 italic'>"{item.review}"</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
