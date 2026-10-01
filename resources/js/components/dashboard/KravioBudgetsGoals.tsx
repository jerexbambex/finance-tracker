import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Target, PieChart as PieIcon, Plus, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency as baseFmt } from '@/lib/formatCurrency';
import { KravioCard } from './KravioCard';

interface CategorySpending {
    name: string;
    amount: number;
    currency: string;
    color: string;
}

interface Goal {
    name: string;
    percentage: number;
    current_amount: number;
    target_amount: number;
    currency: string;
}

interface KravioBudgetsGoalsProps {
    categorySpending: CategorySpending[];
    goals: Goal[];
    primaryCurrency: string;
    className?: string;
}

export function KravioBudgetsGoals({
    categorySpending,
    goals,
    primaryCurrency,
    className,
}: KravioBudgetsGoalsProps) {
    const [activeSection, setActiveSection] = useState<'categories' | 'goals'>(
        categorySpending.length > 0 ? 'categories' : 'goals',
    );

    const totalCategorySpend = categorySpending.reduce((sum, c) => sum + c.amount, 0);
    const formatCurrency = (val: number, curr: string = primaryCurrency) => baseFmt(val, curr);

    return (
        <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-4', className)}>
            {/* Category Breakdown Donut */}
            <KravioCard
                pattern
                className="animate-rise [animation-delay:280ms]"
                innerClassName="p-4 sm:p-5 flex flex-col justify-between h-full"
            >
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <PieIcon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">
                                Spending Breakdown
                            </h3>
                            <p className="text-[11px] text-muted-foreground">Top categories this month</p>
                        </div>
                    </div>
                    <Link
                        href="/categories"
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                    >
                        Categories <ChevronRight className="h-3 w-3" />
                    </Link>
                </div>

                {categorySpending.length > 0 ? (
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
                        {/* Donut Chart */}
                        <div className="relative h-44 w-44 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload as CategorySpending;
                                                const pct =
                                                    totalCategorySpend > 0
                                                        ? ((data.amount / totalCategorySpend) * 100).toFixed(1)
                                                        : '0';
                                                return (
                                                    <div className="rounded-lg border border-border/70 bg-card p-2 shadow-md text-xs">
                                                        <p className="font-semibold text-foreground">{data.name}</p>
                                                        <p className="font-mono text-muted-foreground">
                                                            {formatCurrency(data.amount, data.currency)} ({pct}%)
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Pie
                                        data={categorySpending}
                                        dataKey="amount"
                                        nameKey="name"
                                        innerRadius={50}
                                        outerRadius={75}
                                        paddingAngle={3}
                                        strokeWidth={0}
                                    >
                                        {categorySpending.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color || `var(--chart-${(index % 5) + 1})`}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                    Total
                                </span>
                                <span className="font-mono text-xs font-bold text-foreground">
                                    {formatCurrency(totalCategorySpend)}
                                </span>
                            </div>
                        </div>

                        {/* Category Legend List */}
                        <div className="flex-1 w-full space-y-2">
                            {categorySpending.map((cat, idx) => {
                                const pct =
                                    totalCategorySpend > 0
                                        ? ((cat.amount / totalCategorySpend) * 100).toFixed(0)
                                        : '0';
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between gap-2 text-xs"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span
                                                className="h-2 w-2 rounded-full shrink-0"
                                                style={{
                                                    backgroundColor:
                                                        cat.color || `var(--chart-${(idx % 5) + 1})`,
                                                }}
                                            />
                                            <span className="font-medium text-foreground truncate">
                                                {cat.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 font-mono">
                                            <span className="text-muted-foreground font-medium">
                                                {formatCurrency(cat.amount, cat.currency)}
                                            </span>
                                            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-secondary-foreground">
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                        No category spend recorded this month yet.
                    </div>
                )}
            </KravioCard>

            {/* Goals Progress Card */}
            <KravioCard
                pattern
                className="animate-rise [animation-delay:320ms]"
                innerClassName="p-4 sm:p-5 flex flex-col justify-between h-full"
            >
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                            <Target className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">
                                Savings Goals
                            </h3>
                            <p className="text-[11px] text-muted-foreground">Target milestones & progress</p>
                        </div>
                    </div>
                    <Link
                        href="/goals/create"
                        className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Goal</span>
                    </Link>
                </div>

                <div className="mt-4 space-y-4 flex-1">
                    {goals.length > 0 ? (
                        goals.slice(0, 4).map((goal, index) => {
                            const pct = Math.min(goal.percentage, 100);
                            const isComplete = goal.percentage >= 100;

                            return (
                                <div key={index} className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            {isComplete ? (
                                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                            ) : (
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                            )}
                                            <span className="font-semibold text-foreground truncate">
                                                {goal.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 font-mono">
                                            <span className="text-muted-foreground text-[11px]">
                                                {formatCurrency(goal.current_amount, goal.currency)} /{' '}
                                                {formatCurrency(goal.target_amount, goal.currency)}
                                            </span>
                                            <span
                                                className={cn(
                                                    'rounded px-1.5 py-0.5 text-[10px] font-bold',
                                                    isComplete
                                                        ? 'bg-emerald-500/10 text-emerald-600'
                                                        : 'bg-secondary text-secondary-foreground',
                                                )}
                                            >
                                                {pct.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Meter */}
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/80">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all duration-500',
                                                isComplete
                                                    ? 'bg-emerald-500'
                                                    : 'bg-gradient-to-r from-primary to-teal-400',
                                            )}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                            <p>No active savings goals set yet.</p>
                            <Link
                                href="/goals/create"
                                className="mt-2 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Create your first goal
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{goals.length} active savings milestone{goals.length !== 1 ? 's' : ''}</span>
                    <Link href="/goals" className="font-semibold text-foreground hover:text-primary">
                        View All Goals →
                    </Link>
                </div>
            </KravioCard>
        </div>
    );
}
