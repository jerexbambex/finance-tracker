import { Link } from '@inertiajs/react';
import { ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border/50 pt-24 pb-12">
            <div className="container mx-auto px-6 max-w-7xl">

                {/* Final CTA */}
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 px-6 py-20 text-center mb-24">
                    {/* Background Glows */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />

                    <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
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
                                className="h-12 px-8 rounded-full bg-emerald-500 text-white font-semibold text-lg hover:bg-emerald-400 transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2"
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
