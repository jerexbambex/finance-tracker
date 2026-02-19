import { Head } from '@inertiajs/react';

import CTA from '@/components/Landing/CTA';
import Features from '@/components/Landing/Features';
import Footer from '@/components/Landing/Footer';
import Hero from '@/components/Landing/Hero';
import HowItWorks from '@/components/Landing/HowItWorks';
import Navbar from '@/components/Landing/Navbar';
import PainPoints from '@/components/Landing/PainPoints';
import PricingTeaser from '@/components/Landing/PricingTeaser';
import Security from '@/components/Landing/Security';
import Testimonials from '@/components/Landing/Testimonials';
import UnifiedWorkspace from '@/components/Landing/UnifiedWorkspace';
import UseCaseTabs from '@/components/Landing/UseCaseTabs';




export default function Welcome() {
    return (
        <>
            <Head title="Modern Finance & Budgeting" />

            <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
                <Navbar />

                <main>
                    <Hero />
                    <PainPoints />
                    <UnifiedWorkspace />
                    <Features />
                    <UseCaseTabs />
                    <HowItWorks />
                    <Security />
                    <Testimonials />
                    <PricingTeaser />
                    <CTA />
                </main>

                <Footer />
            </div>
        </>
    );
}
