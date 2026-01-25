import SectionTitle from '@/components/section-title';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { motion } from "framer-motion";

export default function FaqSection() {
    const [isOpen, setIsOpen] = useState(false);
    const data = [
        {
            question: 'Is KiwiCar free to use?',
            answer: 'Yes! Browsing listings, searching vehicles, and viewing NZTA data is completely free. We only charge a small fee when you successfully sell a vehicle through our platform.',
        },
        {
            question: 'Where does the vehicle data come from?',
            answer: 'All vehicle information is sourced directly from the New Zealand Transport Agency (NZTA) database. This includes WoF/CoF history, odometer readings, registration status, and any recorded damage or theft reports.',
        },
        {
            question: 'How accurate is the AI pricing?',
            answer: 'Our AI analyzes thousands of recent sales and current listings across New Zealand to provide market-based valuations. While no estimate is perfect, our pricing is typically within 5-10% of actual sale prices and is updated in real-time as market conditions change.',
        },
        {
            question: 'Can I list my car if it\'s not registered in NZ?',
            answer: 'Currently, KiwiCar only supports vehicles registered in New Zealand with a valid NZ plate number. This allows us to provide verified NZTA data for every listing. Import vehicles can be listed once they\'re NZ-registered.',
        },
        {
            question: 'How do I contact a seller?',
            answer: 'Once you find a car you\'re interested in, click the "Contact Seller" button on the listing page. You can send a message through our secure platform — your phone number and email stay private until you choose to share them.',
        },
    ];

    return (
        <section className='mt-32' id="faq">
            <SectionTitle title="Frequently Asked Questions" description="Got questions? We've got answers. Here's what people commonly ask about KiwiCar." />
            <div className='mx-auto mt-12 space-y-4 w-full max-w-xl'>
                {data.map((item, index) => (
                    <motion.div key={index} className='flex flex-col glass rounded-md'
                        initial={{ y: 150, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: `${index * 0.1}`, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <h3 className='flex cursor-pointer hover:bg-white/10 transition items-start justify-between gap-4 p-4 font-medium' onClick={() => setIsOpen(isOpen === index ? null : index)}>
                            {item.question}
                            <ChevronDownIcon className={`size-5 transition-all shrink-0 duration-400 ${isOpen === index ? 'rotate-180' : ''}`} />
                        </h3>
                        <p className={`px-4 text-sm/6 text-gray-100 transition-all duration-400 overflow-hidden ${isOpen === index ? 'pt-2 pb-4 max-h-80' : 'max-h-0'}`}>{item.answer}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
