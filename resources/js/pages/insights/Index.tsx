import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb, Sparkles, ArrowUpRight, ArrowDownRight, Calendar, DollarSign, Repeat } from 'lucide-react';
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

            <div className="flex-1 space-y-6 p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Spending Insights</h1>
                        <p className="text-muted-foreground text-lg mt-2">Discover patterns and opportunities in your spending</p>
                    </div>
                    <Button onClick={generateAiInsights} disabled={loadingAi} size="lg" className="w-fit">
                        <Sparkles className="mr-2 h-5 w-5" />
                        {loadingAi ? 'Analyzing with AI...' : 'Get AI Insights'}
                    </Button>
                </div>

                {/* AI Insights */}
                {aiInsights && (
                    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-background shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>AI-Powered Analysis</CardTitle>
                                    <CardDescription>Personalized insights from your spending data</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                {aiInsights}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {!hasAnyInsights && (
                    <Card className="border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="p-4 rounded-full bg-muted mb-4">
                                <TrendingUp className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No Insights Available Yet</h3>
                            <p className="text-muted-foreground text-center max-w-md mb-6">
                                Start tracking your expenses to unlock personalized spending insights and smart recommendations.
                            </p>
                            <Button asChild>
                                <Link href="/transactions/create">Add Your First Transaction</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Insights Grid */}
                {hasAnyInsights && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Unusual Spending */}
                        {insights.unusual_spending.length > 0 && (
                            <Card className="border-l-4 border-l-orange-500">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950">
                                            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <CardTitle>Unusual Spending</CardTitle>
                                            <CardDescription>Higher than your 3-month average</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {insights.unusual_spending.map((item, index) => (
                                        <div key={index} className="group relative overflow-hidden rounded-xl border bg-card p-4 hover:shadow-md transition-all">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <p className="font-semibold">{item.category}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="destructive" className="font-mono">
                                                            <ArrowUpRight className="h-3 w-3 mr-1" />
                                                            +{item.increase_percent}%
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">vs avg {formatCurrency(item.average!)}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold">{formatCurrency(item.current!)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Savings Opportunities */}
                        {insights.savings_opportunities.length > 0 && (
                            <Card className="border-l-4 border-l-yellow-500">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950">
                                            <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <div>
                                            <CardTitle>Savings Opportunities</CardTitle>
                                            <CardDescription>Ways to optimize your budget</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {insights.savings_opportunities.map((item, index) => (
                                        <div key={index} className="group relative overflow-hidden rounded-xl border bg-card p-4 hover:shadow-md transition-all">
                                            {item.category && (
                                                <>
                                                    <div className="flex items-start justify-between mb-3">
                                                        <p className="font-semibold">{item.category}</p>
                                                        <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                                                            Over Budget
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">Budgeted</span>
                                                            <span className="font-medium">{formatCurrency(item.budgeted!)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">Spent</span>
                                                            <span className="font-medium text-orange-600">{formatCurrency(item.spent!)}</span>
                                                        </div>
                                                        <div className="pt-2 border-t">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium">Reduce by</span>
                                                                <span className="text-lg font-bold text-yellow-600">{formatCurrency(item.overspend!)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {item.type === 'small_purchases' && (
                                                <>
                                                    <p className="font-semibold mb-2">Small Purchases</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">{item.count} purchases under $20</span>
                                                        <span className="text-xl font-bold">{formatCurrency(item.total!)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Category Trends */}
                        {insights.category_trends.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                                            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <CardTitle>Category Trends</CardTitle>
                                            <CardDescription>3-month spending patterns</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {insights.category_trends.map((item, index) => (
                                        <div key={index} className="group relative overflow-hidden rounded-xl border bg-card p-4 hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${
                                                        item.trend === 'increasing' ? 'bg-red-100 dark:bg-red-950' :
                                                        item.trend === 'decreasing' ? 'bg-green-100 dark:bg-green-950' :
                                                        'bg-gray-100 dark:bg-gray-800'
                                                    }`}>
                                                        {item.trend === 'increasing' && <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />}
                                                        {item.trend === 'decreasing' && <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />}
                                                        {item.trend === 'stable' && <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{item.category}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{item.trend}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold">{formatCurrency(item.total!)}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        {item.months?.map(m => formatCurrency(m).replace('$', '')).join(' → ')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Recurring Expenses */}
                        {insights.recurring_expenses.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                                            <Repeat className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <CardTitle>Recurring Expenses</CardTitle>
                                            <CardDescription>Detected repeated transactions</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {insights.recurring_expenses.map((item, index) => (
                                        <div key={index} className="group relative overflow-hidden rounded-xl border bg-card p-4 hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold mb-2">{item.description}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {item.category}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {item.frequency}x in 3 months
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xl font-bold ml-4">{formatCurrency(item.amount!)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Spending Patterns */}
                        {insights.spending_patterns.length > 0 && (
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                                            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <CardTitle>Spending Patterns</CardTitle>
                                            <CardDescription>Your spending behavior insights</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {insights.spending_patterns.map((item, index) => (
                                            <div key={index}>
                                                {item.type === 'weekend_vs_weekday' && (
                                                    <div className="rounded-xl border bg-card p-6">
                                                        <p className="font-semibold mb-4 flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            Weekend vs Weekday
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <p className="text-sm text-muted-foreground">Weekend</p>
                                                                <p className="text-2xl font-bold">{formatCurrency(item.weekend!)}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-sm text-muted-foreground">Weekday</p>
                                                                <p className="text-2xl font-bold">{formatCurrency(item.weekday!)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {item.type === 'average_transaction' && (
                                                    <div className="rounded-xl border bg-card p-6">
                                                        <p className="font-semibold mb-4 flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4" />
                                                            Average Transaction
                                                        </p>
                                                        <p className="text-4xl font-bold">{formatCurrency(item.amount!)}</p>
                                                        <p className="text-sm text-muted-foreground mt-1">per transaction</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
            </div>
        </AppLayout>
    );
}
