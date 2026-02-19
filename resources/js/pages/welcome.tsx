import { Head } from '@inertiajs/react';
import Navbar from '@/components/Landing/Navbar';
import Hero from '@/components/Landing/Hero';
import PainPoints from '@/components/Landing/PainPoints';
import UnifiedWorkspace from '@/components/Landing/UnifiedWorkspace';
import Features from '@/components/Landing/Features';
import HowItWorks from '@/components/Landing/HowItWorks';
import Security from '@/components/Landing/Security';
import PricingTeaser from '@/components/Landing/PricingTeaser';
import Testimonials from '@/components/Landing/Testimonials';
import Footer from '@/components/Landing/Footer';




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
                    <HowItWorks />
                    <Security />
                    <Testimonials />
                    <PricingTeaser />
                </main>

                <Footer />
            </div>
        </>
    );
}
