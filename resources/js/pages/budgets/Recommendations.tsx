import { Head, Link, router } from '@inertiajs/react';
import { TrendingUp, Lightbulb, Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';

import { KravioCard, KravioCardPattern } from '@/components/dashboard/KravioCard';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatCurrency';

interface Recommendation {
  category_id: string;
  category_name: string;
  category_color?: string;
  avg_spending: number;
  recommended_amount: number;
  currency: string;
  has_budget: boolean;
}

interface Props {
  recommendations: Recommendation[];
}

export default function Recommendations({ recommendations }: Props) {
  const handleApply = (categoryId: string, amount: number, currency: string) => {
    router.post('/budgets/recommendations/apply', {
      category_id: categoryId,
      amount: amount,
      currency: currency,
    });
  };

  return (
    <AppLayout>
      <Head title="Budget Recommendations" />

      <div className="py-6 sm:py-8 space-y-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/budgets"
                  className="p-1.5 rounded-lg border border-border/70 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Budget Recommendations</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Smart Suggestions
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Personalized monthly targets generated from your spending history over the last 3 months.
              </p>
            </div>

            <Link href="/budgets">
              <Button variant="outline" size="sm" className="rounded-xl text-xs h-9 border-border/70">
                Back to Budgets
              </Button>
            </Link>
          </div>

          {recommendations.length === 0 ? (
            <KravioCard className="p-12 text-center" pattern>
              <div className="w-12 h-12 rounded-2xl bg-muted/80 border border-border/70 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">No recommendations available yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                Keep logging your expenses for a couple more weeks and our engine will calculate automated budgeting targets.
              </p>
              <Link href="/transactions/create">
                <Button size="sm" className="rounded-xl text-xs">
                  Record an Expense
                </Button>
              </Link>
            </KravioCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <KravioCard
                  key={rec.category_id}
                  className="p-5 flex flex-col justify-between"
                  pattern
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3.5 h-3.5 rounded-full ring-2 ring-offset-2 ring-border/50"
                          style={{ backgroundColor: rec.category_color || '#6b7280' }}
                        />
                        <h3 className="font-semibold text-sm tracking-tight text-foreground">{rec.category_name}</h3>
                      </div>
                      {rec.has_budget && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/50">
                          Active Target
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                        <p className="text-[11px] text-muted-foreground uppercase font-mono tracking-wider">3-Mo Avg Spending</p>
                        <p className="text-lg font-bold font-mono tabular-nums text-foreground mt-0.5">
                          {formatCurrency(rec.avg_spending, rec.currency)}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-100">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>Suggested Allocation</span>
                        </div>
                        <p className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
                          {formatCurrency(rec.recommended_amount, rec.currency)}
                        </p>
                        <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                          Includes a +10% flexible safety buffer
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full text-xs h-9 rounded-xl gap-1.5 shadow-sm"
                    onClick={() => handleApply(rec.category_id, rec.recommended_amount, rec.currency)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Apply This Budget
                  </Button>
                </KravioCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

