import Footer from '@/components/footer';
import Navbar from '@/components/navbar';

export const metadata = {
    title: 'Genesis - PrebuiltUI',
    description: 'Design AI assistants that research, plan, and execute tasks — all powered by your prompts.',
    appleWebApp: {
        title: 'Genesis - PrebuiltUI',
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
