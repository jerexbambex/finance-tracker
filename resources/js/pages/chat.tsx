import { Head } from '@inertiajs/react';
import { ArrowUpRight, Bot, Lightbulb, Sparkles, Zap } from 'lucide-react';
import { useRef } from 'react';

import { ChatWindow, type ChatWindowHandle } from '@/components/Chat/ChatWindow';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'AI Chat', href: '/chat' },
];

const promptIdeas = [
    { text: 'Show my spending for this month by category', icon: Sparkles },
    { text: 'Create a $500 food budget for this month', icon: Bot },
    { text: 'Add a $42.50 grocery expense from my checking account', icon: Zap },
    { text: 'How close am I to my transport budget?', icon: ArrowUpRight },
];

const tips = [
    "Include the amount and whether it's income or expense when adding a transaction.",
    'Mention the account name if you have more than one account.',
    'Use exact month or date wording for reliable budget or summary results.',
];

export default function Chat() {
    const chatRef = useRef<ChatWindowHandle>(null);

    const inject = (text: string) => {
        chatRef.current?.send(text);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AI Chat" />

            <div className="flex-1 p-4 md:p-6">
                <div className="mx-auto max-w-7xl space-y-4">

                    {/* Compact header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">AI Finance Chat</h1>
                                <p className="text-xs text-muted-foreground">Powered by GPT-4 & Claude · your data, your context</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/8 px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                        </div>
                    </div>

                    {/* Two-column layout */}
                    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">

                        <ChatWindow
                            ref={chatRef}
                            className="border-border/40"
                            title="Finance Assistant"
                            description="Ask in plain English — budgets, transactions, summaries"
                        />

                        {/* Sidebar */}
                        <div className="space-y-4 xl:sticky xl:top-6">

                            {/* Clickable prompt ideas */}
                            <Card className="border-border/50">
                                <CardContent className="space-y-3 p-4">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4 text-amber-500" />
                                        <p className="text-sm font-medium">Try asking</p>
                                    </div>
                                    <div className="space-y-2">
                                        {promptIdeas.map((idea) => (
                                            <button
                                                key={idea.text}
                                                onClick={() => inject(idea.text)}
                                                className="group w-full flex items-start gap-2.5 rounded-2xl border border-border/60 bg-muted/20 px-3 py-3 text-left text-xs leading-5 text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/30 transition-all"
                                            >
                                                <idea.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                                <span>{idea.text}</span>
                                                <ArrowUpRight className="mt-0.5 h-3 w-3 shrink-0 ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tips */}
                            <Card className="border-border/50 bg-muted/20">
                                <CardContent className="space-y-3 p-4">
                                    <p className="text-sm font-medium">What works best</p>
                                    <div className="space-y-2">
                                        {tips.map((tip) => (
                                            <div key={tip} className="flex items-start gap-2.5 rounded-2xl border border-border/60 bg-background/85 px-3 py-3 text-xs leading-5 text-muted-foreground">
                                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                                                {tip}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Context note */}
                            <p className="px-1 text-[11px] text-muted-foreground leading-relaxed">
                                The assistant reads your conversations for context. All financial actions run through secured tools — the AI never writes directly to your data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
