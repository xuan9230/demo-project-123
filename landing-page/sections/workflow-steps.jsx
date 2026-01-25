'use client';

import { motion } from "framer-motion";
import SectionTitle from "@/components/section-title";
import { useState } from "react";

const buyerSteps = [
    {
        id: 1,
        title: "Search & Filter",
        description: "Browse thousands of verified listings. Filter by make, model, price, location, and more to find exactly what you're looking for.",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=60",
    },
    {
        id: 2,
        title: "Check the Facts",
        description: "View complete NZTA history for any vehicle. See WoF records, odometer readings, ownership changes, and any reported damage — all in one place.",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=60",
    },
    {
        id: 3,
        title: "Connect & Buy",
        description: "Contact sellers directly through our secure messaging system. Arrange viewings, negotiate, and complete your purchase with confidence.",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&auto=format&fit=crop&q=60",
    },
];

const sellerSteps = [
    {
        id: 1,
        title: "Enter Your Plate",
        description: "Just type in your registration plate. We'll automatically fetch your vehicle details from NZTA — no manual data entry required.",
        image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&auto=format&fit=crop&q=60",
    },
    {
        id: 2,
        title: "Upload Photos",
        description: "Add photos of your car from your phone or computer. Our AI will analyze them to highlight key features and condition.",
        image: "https://images.unsplash.com/photo-1493238792000-8113da705763?w=800&auto=format&fit=crop&q=60",
    },
    {
        id: 3,
        title: "Set Price & Publish",
        description: "Get an AI-recommended price based on market data. Adjust if you like, then publish your listing in one click.",
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=60",
    },
];

export default function WorkflowSteps() {
    const [activeTab, setActiveTab] = useState('buyers');
    const steps = activeTab === 'buyers' ? buyerSteps : sellerSteps;

    return (
        <section className="mt-32 relative" id="how-it-works">
            <SectionTitle
                title="Simple for Buyers. Effortless for Sellers."
                description="Whether you're looking for your next car or selling your current one, KiwiCar makes the process seamless."
            />

            <div className="flex justify-center mt-8">
                <div className="inline-flex rounded-lg glass p-1">
                    <button
                        onClick={() => setActiveTab('buyers')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'buyers'
                                ? 'bg-green-500 text-black'
                                : 'text-white hover:text-green-400'
                        }`}
                    >
                        For Buyers
                    </button>
                    <button
                        onClick={() => setActiveTab('sellers')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'sellers'
                                ? 'bg-green-500 text-black'
                                : 'text-white hover:text-green-400'
                        }`}
                    >
                        For Sellers
                    </button>
                </div>
            </div>

            <motion.div
                className="relative space-y-20 md:space-y-30 mt-16"
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex-col items-center hidden md:flex absolute left-1/2 -translate-x-1/2">
                    <p className="flex items-center justify-center font-medium my-10 aspect-square bg-green-500/20 text-green-400 p-2 rounded-full">
                        01
                    </p>
                    <div className="h-72 w-0.5 bg-gradient-to-b from-transparent via-green-500/50 to-transparent" />
                    <p className="flex items-center justify-center font-medium my-10 aspect-square bg-green-500/20 text-green-400 p-2 rounded-full">
                        02
                    </p>
                    <div className="h-72 w-0.5 bg-gradient-to-b from-transparent via-green-500/50 to-transparent" />
                    <p className="flex items-center justify-center font-medium my-10 aspect-square bg-green-500/20 text-green-400 p-2 rounded-full">
                        03
                    </p>
                </div>
                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        className={`flex items-center justify-center gap-6 md:gap-20 ${index % 2 !== 0 ? 'flex-col md:flex-row-reverse' : 'flex-col md:flex-row'}`}
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <img
                            src={step.image}
                            alt={step.title}
                            className="flex-1 h-auto w-full max-w-sm rounded-2xl object-cover aspect-video"
                        />
                        <div className="flex-1 flex flex-col gap-4 md:px-6 max-w-md">
                            <span className="text-green-500 text-sm font-medium md:hidden">Step {step.id}</span>
                            <h3 className="text-2xl font-medium text-white">
                                {step.title}
                            </h3>
                            <p className="text-gray-100 text-sm/6">
                                {step.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
