import { Head } from '@inertiajs/react';

import CookieConsent from '@/components/Landing/CookieConsent';
import CTA from '@/components/Landing/CTA';
import Features from '@/components/Landing/Features';
import Footer from '@/components/Landing/Footer';
import Hero from '@/components/Landing/Hero';
import HowItWorks from '@/components/Landing/HowItWorks';
import Navbar from '@/components/Landing/Navbar';
import Security from '@/components/Landing/Security';
import Testimonials from '@/components/Landing/Testimonials';

export default function Welcome() {
    return (
        <>
            <Head title="Budgets, goals and bills in one ledger" />

            <div className="min-h-screen overflow-x-hidden bg-background font-sans text-foreground selection:bg-primary/20">
                <Navbar />

                <main>
                    <Hero />
                    <Features />
                    <HowItWorks />
                    <Security />
                    <Testimonials />
                    <CTA />
                </main>

                <CookieConsent />

                <Footer />
            </div>
        </>
    );
}
