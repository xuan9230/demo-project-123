'use client';

import { CheckCircleIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function CallToAction() {
    const [email, setEmail] = useState('');
    const [region, setRegion] = useState('');
    const [isSeller, setIsSeller] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call - replace with actual endpoint
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSubmitted(true);
        setIsLoading(false);
    };

    return (
        <motion.div
            className="flex flex-col max-w-2xl mt-40 px-6 mx-auto items-center justify-center text-center py-12 rounded-xl glass"
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            id="waitlist"
        >
            {isSubmitted ? (
                <motion.div
                    className="flex flex-col items-center py-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                        <CheckCircleIcon className="size-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-2">You're on the list!</h2>
                    <p className="text-gray-100 max-w-sm">
                        Thanks for joining! We'll email you as soon as KiwiCar is ready to launch in your region.
                    </p>
                </motion.div>
            ) : (
                <>
                    <motion.h2 className="text-2xl md:text-3xl font-semibold mt-2"
                        initial={{ y: 80, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
                    >
                        Be the First to Know When We Launch
                    </motion.h2>
                    <motion.p className="mt-4 text-sm/7 max-w-md text-gray-100"
                        initial={{ y: 80, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 200, damping: 70, mass: 1 }}
                    >
                        Join the waitlist to get early access when KiwiCar launches in your area. We'll send you one email — no spam, ever.
                    </motion.p>

                    <motion.form
                        onSubmit={handleSubmit}
                        className="w-full max-w-sm mt-8 space-y-4"
                        initial={{ y: 80, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
                    >
                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                            />
                        </div>

                        <div>
                            <select
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition appearance-none cursor-pointer"
                            >
                                <option value="" disabled className="bg-neutral-900">Select your region</option>
                                <option value="auckland" className="bg-neutral-900">Auckland</option>
                                <option value="wellington" className="bg-neutral-900">Wellington</option>
                                <option value="christchurch" className="bg-neutral-900">Christchurch</option>
                                <option value="other" className="bg-neutral-900">Other</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 text-left">
                            <input
                                type="checkbox"
                                id="seller-interest"
                                checked={isSeller}
                                onChange={(e) => setIsSeller(e.target.checked)}
                                className="w-4 h-4 rounded border-white/20 bg-white/10 text-green-500 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <label htmlFor="seller-interest" className="text-sm text-gray-100 cursor-pointer">
                                I'm interested in selling a car
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn bg-green-500 hover:bg-green-600 text-black font-medium py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Joining...' : 'Join the Waitlist'}
                        </button>

                        <p className="text-xs text-gray-400">
                            By joining, you agree to our Privacy Policy. We respect your inbox.
                        </p>
                    </motion.form>
                </>
            )}
        </motion.div>
    );
}
