import { Link } from '@inertiajs/react';
import { ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border/50 pt-24 pb-12">
            <div className="container mx-auto px-6 max-w-7xl">

                {/* Final CTA */}
                <div className="relative mb-24 overflow-hidden rounded-3xl border border-emerald-500/10 bg-[#050806] px-6 py-20 text-center shadow-2xl shadow-emerald-950/10">
                    {/* Background Glows */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />
                    <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />

                    <div className="relative z-10 mx-auto max-w-2xl space-y-8">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                            Start building your legacy today.
                        </h2>
                        <p className="text-lg text-slate-300">
                            Join the financial platform designed for modern professionals.
                            Secure, fast, and intelligent.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/register"
                                className="flex h-12 items-center gap-2 rounded-full bg-emerald-500 px-8 text-lg font-semibold text-white shadow-lg shadow-emerald-950/30 transition-all hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-500/20"
                            >
                                Get Started Free
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                        <p className="text-sm text-slate-500">
                            No credit card required. Free tier available forever.
                        </p>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12 border-b border-border/50 pb-12">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                                B
                            </div>
                            <span className="font-bold text-xl tracking-tight">BudgetApp</span>
                        </div>
                        <p className="text-muted-foreground mb-6 max-w-xs">
                            The intelligent financial operating system for your personal wealth.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="h-5 w-5" /></a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="h-5 w-5" /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Product</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Roadmap</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Company</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Resources</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">API Status</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© 2024 BudgetApp Inc. All rights reserved.</p>
                    <div className="flex gap-8">
                        <span>Made with ❤️ for financial freedom.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
