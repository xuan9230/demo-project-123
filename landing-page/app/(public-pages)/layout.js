import Footer from '@/components/footer';
import Navbar from '@/components/navbar';

export const metadata = {
    title: 'KiwiCar — Buy & Sell Used Cars in New Zealand with Confidence',
    description: 'KiwiCar is the smarter way to buy and sell used cars in New Zealand. Get instant NZTA vehicle history, AI-powered pricing, and connect with verified buyers and sellers.',
    appleWebApp: {
        title: 'KiwiCar',
    },
    openGraph: {
        title: 'KiwiCar — Buy & Sell Used Cars in New Zealand with Confidence',
        description: 'KiwiCar is the smarter way to buy and sell used cars in New Zealand. Get instant NZTA vehicle history, AI-powered pricing, and connect with verified buyers and sellers.',
        type: 'website',
        locale: 'en_NZ',
        siteName: 'KiwiCar',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'KiwiCar — Buy & Sell Used Cars in New Zealand with Confidence',
        description: 'KiwiCar is the smarter way to buy and sell used cars in New Zealand. Get instant NZTA vehicle history, AI-powered pricing, and connect with verified buyers and sellers.',
    },
};

export default function Layout({ children }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
