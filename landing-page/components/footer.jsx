'use client';
import { FacebookIcon, InstagramIcon, LinkedinIcon, CarIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
    const links = [
        { name: 'About Us', href: '#about' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Privacy Policy', href: '#privacy' },
        { name: 'Terms of Service', href: '#terms' },
        { name: 'Contact Us', href: '#contact' },
    ];
    return (
        <motion.footer className="flex flex-col items-center px-4 md:px-16 lg:px-24 justify-center w-full pt-16 mt-40 glass border-0"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <a href="/" className="flex items-center gap-2">
                <CarIcon className="size-7 text-green-500" />
                <span className="text-xl font-bold">KiwiCar</span>
            </a>

            <div className="flex flex-wrap items-center justify-center gap-8 py-8">
                {links.map((link, index) => (
                    <Link key={index} href={link.href} className='transition hover:text-green-400'>
                        {link.name}
                    </Link>
                ))}
            </div>
            <div className="flex items-center gap-6 pb-6">
                <a href="#" className="hover:-translate-y-0.5 text-gray-200 hover:text-green-400 transition-all duration-300">
                    <FacebookIcon />
                </a>
                <a href="#" className="hover:-translate-y-0.5 text-gray-200 hover:text-green-400 transition-all duration-300">
                    <InstagramIcon />
                </a>
                <a href="#" className="hover:-translate-y-0.5 text-gray-200 hover:text-green-400 transition-all duration-300">
                    <LinkedinIcon />
                </a>
            </div>
            <hr className="w-full border-white/20 mt-6" />
            <div className="flex flex-col md:flex-row items-center w-full justify-between gap-4 py-4">
                <p className="text-gray-400 text-sm">Built with love in New Zealand</p>
                <p className="text-gray-400 text-sm">&copy; 2024 KiwiCar. All rights reserved.</p>
            </div>
        </motion.footer>
    );
}
