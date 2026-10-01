import { Head, Link, router } from '@inertiajs/react';
import { Plus, Folder, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { KravioCard } from '@/components/dashboard/KravioCard';

interface Category {
  id: string;
  name: string;
  type: string;
  color?: string;
  user_id?: string;
}

interface Props {
  incomeCategories: Category[];
  expenseCategories: Category[];
}

export default function Index({ incomeCategories, expenseCategories }: Props) {
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      router.delete(`/categories/${id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="Categories" />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* ── Kravio Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-rise">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Transaction Categories</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Organize income and expenses with customizable color-coded labels and tags.
            </p>
          </div>
          <Link href="/categories/create">
            <Button size="sm" className="h-8 text-xs font-semibold gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New Category
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Income Categories */}
          <KravioCard
            pattern
            className="animate-rise [animation-delay:100ms]"
            innerClassName="p-4 sm:p-5 flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Income Categories</h2>
                    <p className="text-[11px] text-muted-foreground">Sources of revenue and earnings</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono">
                  {incomeCategories.length}
                </Badge>
              </div>

              <div className="mt-3 space-y-2">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/40 p-2.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="h-3 w-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: category.color || '#10b981' }}
                      />
                      <span className="text-xs font-semibold text-foreground truncate">{category.name}</span>
                      {!category.user_id && (
                        <span className="rounded bg-secondary px-1.5 py-0.2 text-[9px] font-semibold text-secondary-foreground">
                          Default
                        </span>
                      )}
                    </div>

                    {category.user_id && (
                      <div className="flex items-center gap-1">
                        <Link href={`/categories/${category.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="h-6 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {incomeCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground py-4 text-center">No income categories created.</p>
                )}
              </div>
            </div>
          </KravioCard>

          {/* Expense Categories */}
          <KravioCard
            pattern
            className="animate-rise [animation-delay:150ms]"
            innerClassName="p-4 sm:p-5 flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                    <ArrowDownRight className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Expense Categories</h2>
                    <p className="text-[11px] text-muted-foreground">Spending buckets & classifications</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono">
                  {expenseCategories.length}
                </Badge>
              </div>

              <div className="mt-3 space-y-2">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/40 p-2.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="h-3 w-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: category.color || '#ef4444' }}
                      />
                      <span className="text-xs font-semibold text-foreground truncate">{category.name}</span>
                      {!category.user_id && (
                        <span className="rounded bg-secondary px-1.5 py-0.2 text-[9px] font-semibold text-secondary-foreground">
                          Default
                        </span>
                      )}
                    </div>

                    {category.user_id && (
                      <div className="flex items-center gap-1">
                        <Link href={`/categories/${category.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="h-6 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {expenseCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground py-4 text-center">No expense categories created.</p>
                )}
              </div>
            </div>
          </KravioCard>
        </div>
      </div>
    </AppLayout>
  );
}
