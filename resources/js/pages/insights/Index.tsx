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

    const hasAnyInsights = 
        insights.unusual_spending.length > 0 ||
        insights.category_trends.length > 0 ||
        insights.recurring_expenses.length > 0 ||
        insights.spending_patterns.length > 0 ||
        insights.savings_opportunities.length > 0;

    return (
        <AppLayout>
            <Head title="Spending Insights" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Spending Insights</h1>
                        <p className="text-muted-foreground mt-1">AI-powered analysis of your spending patterns</p>
                    </div>
                    <Button onClick={generateAiInsights} disabled={loadingAi} size="lg" className="w-full sm:w-auto">
                        <Sparkles className="mr-2 h-4 w-4" />
                        {loadingAi ? 'Analyzing...' : 'Get AI Insights'}
                    </Button>
                </div>

                {aiInsights && (
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                AI-Powered Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
                                {aiInsights}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!hasAnyInsights && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
                            <p className="text-muted-foreground text-center max-w-md">
                                Start tracking your expenses to get personalized spending insights and recommendations.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {insights.unusual_spending.length > 0 && (
                        <Card className="border-orange-200 dark:border-orange-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                    <AlertTriangle className="h-5 w-5" />
                                    Unusual Spending
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">Categories with higher than usual spending</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {insights.unusual_spending.map((item, index) => (
                                        <div key={index} className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <p className="font-medium text-orange-900 dark:text-orange-100">{item.category}</p>
                                                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                                        {item.increase_percent}% higher than usual
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-orange-900 dark:text-orange-100">{formatCurrency(item.current!)}</p>
                                                    <p className="text-xs text-muted-foreground">avg: {formatCurrency(item.average!)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {insights.savings_opportunities.length > 0 && (
                        <Card className="border-yellow-200 dark:border-yellow-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                    <Lightbulb className="h-5 w-5" />
                                    Savings Opportunities
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">Ways to reduce your spending</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {insights.savings_opportunities.map((item, index) => (
                                        <div key={index} className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900">
                                            {item.category && (
                                                <div>
                                                    <p className="font-medium text-yellow-900 dark:text-yellow-100">{item.category}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                            Budget: {formatCurrency(item.budgeted!)}
                                                        </p>
                                                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                                            Spent: {formatCurrency(item.spent!)}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mt-2">
                                                        💡 Reduce by {formatCurrency(item.overspend!)}
                                                    </p>
                                                </div>
                                            )}
                                            {item.type === 'small_purchases' && (
                                                <div>
                                                    <p className="font-medium text-yellow-900 dark:text-yellow-100">Small Purchases Add Up</p>
                                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                                                        {item.count} purchases under $20 = {formatCurrency(item.total!)}
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

                {insights.category_trends.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Trends</CardTitle>
                            <p className="text-sm text-muted-foreground">Last 3 months spending patterns</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {insights.category_trends.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${
                                                item.trend === 'increasing' ? 'bg-red-100 dark:bg-red-950' :
                                                item.trend === 'decreasing' ? 'bg-green-100 dark:bg-green-950' :
                                                'bg-gray-100 dark:bg-gray-800'
                                            }`}>
                                                {item.trend === 'increasing' && <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />}
                                                {item.trend === 'decreasing' && <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />}
                                                {item.trend === 'stable' && <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.category}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{item.trend} trend</p>
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
                            <p className="text-sm text-muted-foreground">Detected repeated transactions</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {insights.recurring_expenses.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                    {item.category}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    • {item.frequency}x in 3 months
                                                </span>
                                            </div>
                                        </div>
                                        <p className="font-semibold ml-4">{formatCurrency(item.amount!)}</p>
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
                            <p className="text-sm text-muted-foreground">Your spending behavior</p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {insights.spending_patterns.map((item, index) => (
                                    <div key={index}>
                                        {item.type === 'weekend_vs_weekday' && (
                                            <div className="p-4 rounded-lg border">
                                                <p className="font-medium mb-3">Weekend vs Weekday</p>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Weekend</span>
                                                        <span className="text-lg font-semibold">{formatCurrency(item.weekend!)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Weekday</span>
                                                        <span className="text-lg font-semibold">{formatCurrency(item.weekday!)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {item.type === 'average_transaction' && (
                                            <div className="p-4 rounded-lg border">
                                                <p className="font-medium mb-2">Average Transaction</p>
                                                <p className="text-3xl font-bold">{formatCurrency(item.amount!)}</p>
                                                <p className="text-xs text-muted-foreground mt-1">per transaction</p>
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
