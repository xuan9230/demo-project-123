'use client';

import CallToAction from '@/sections/call-to-action';
import FaqSection from '@/sections/faq-section';
import Features from '@/sections/features';
import HeroSection from '@/sections/hero-section';
import ProblemStatement from '@/sections/problem-statement';
import TrustSection from '@/sections/trust-section';
import WorkflowSteps from '@/sections/workflow-steps';

export default function Page() {
    return (
        <main className='px-4'>
            <HeroSection />
            <ProblemStatement />
            <Features />
            <WorkflowSteps />
            <TrustSection />
            <FaqSection />
            <CallToAction />
        </main>
    );
}
