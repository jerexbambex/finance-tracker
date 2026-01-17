import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface Insight {
    category?: string;
    current?: number;
    average?: number;
    increase_percent?: number;
    type?: string;
    message?: string;
    trend?: string;
    months?: number[];
    total?: number;
    description?: string;
    amount?: number;
    frequency?: number;
    weekend?: number;
    weekday?: number;
    budgeted?: number;
    spent?: number;
    overspend?: number;
    count?: number;
}

interface Insights {
    unusual_spending: Insight[];
    category_trends: Insight[];
    recurring_expenses: Insight[];
    spending_patterns: Insight[];
    savings_opportunities: Insight[];
}

interface Props {
    insights: Insights;
}

export default function Index({ insights }: Props) {
    const [aiInsights, setAiInsights] = useState<string | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

    const generateAiInsights = async () => {
        setLoadingAi(true);
        try {
            const response = await axios.post('/insights/ai');
            setAiInsights(response.data.insights);
        } catch (error) {
            console.error('Failed to generate AI insights:', error);
        } finally {
            setLoadingAi(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title="Spending Insights" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Spending Insights</h1>
                        <p className="text-muted-foreground">AI-powered analysis of your spending patterns</p>
                    </div>
                    <Button onClick={generateAiInsights} disabled={loadingAi}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {loadingAi ? 'Analyzing...' : 'Get AI Insights'}
                    </Button>
                </div>

                {aiInsights && (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                AI-Powered Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                                {aiInsights}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {insights.unusual_spending.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                Unusual Spending Detected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {insights.unusual_spending.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium">{item.message}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Current: {formatCurrency(item.current!)} | Average: {formatCurrency(item.average!)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {insights.category_trends.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Trends (Last 3 Months)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {insights.category_trends.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            {item.trend === 'increasing' && <TrendingUp className="h-5 w-5 text-red-500" />}
                                            {item.trend === 'decreasing' && <TrendingDown className="h-5 w-5 text-green-500" />}
                                            {item.trend === 'stable' && <Minus className="h-5 w-5 text-gray-500" />}
                                            <div>
                                                <p className="font-medium">{item.category}</p>
                                                <p className="text-sm text-muted-foreground capitalize">{item.trend}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{formatCurrency(item.total!)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.months?.map(m => formatCurrency(m)).join(' → ')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {insights.recurring_expenses.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recurring Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {insights.recurring_expenses.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div>
                                            <p className="font-medium">{item.description}</p>
                                            <p className="text-sm text-muted-foreground">{item.category} • {item.frequency}x in 3 months</p>
                                        </div>
                                        <p className="font-semibold">{formatCurrency(item.amount!)}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {insights.spending_patterns.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Spending Patterns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {insights.spending_patterns.map((item, index) => (
                                    <div key={index}>
                                        {item.type === 'weekend_vs_weekday' && (
                                            <div className="p-3 rounded-lg border">
                                                <p className="font-medium mb-2">Weekend vs Weekday Spending</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Weekend</p>
                                                        <p className="text-lg font-semibold">{formatCurrency(item.weekend!)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Weekday</p>
                                                        <p className="text-lg font-semibold">{formatCurrency(item.weekday!)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {item.type === 'average_transaction' && (
                                            <div className="p-3 rounded-lg border">
                                                <p className="font-medium">Average Transaction Size</p>
                                                <p className="text-2xl font-semibold mt-1">{formatCurrency(item.amount!)}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {insights.savings_opportunities.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-yellow-500" />
                                Savings Opportunities
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {insights.savings_opportunities.map((item, index) => (
                                    <div key={index} className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                                        {item.category && (
                                            <div>
                                                <p className="font-medium">{item.category}</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Budgeted: {formatCurrency(item.budgeted!)} | Spent: {formatCurrency(item.spent!)}
                                                </p>
                                                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mt-1">
                                                    Reduce by {formatCurrency(item.overspend!)} to meet budget
                                                </p>
                                            </div>
                                        )}
                                        {item.type === 'small_purchases' && (
                                            <div>
                                                <p className="font-medium">Small Purchases Add Up</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {item.count} purchases under $20 totaling {formatCurrency(item.total!)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
