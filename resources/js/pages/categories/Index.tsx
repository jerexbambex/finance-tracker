import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

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
      
      <div className="flex-1 space-y-6 p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
              <p className="text-muted-foreground">Manage your income and expense categories.</p>
            </div>
            <Link href="/categories/create">
              <Button size="sm" className="h-9 gap-2">
                <Plus className="h-[18px] w-[18px]" />
                New Category
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Income Categories</CardTitle>
                <Badge variant="secondary" className="text-xs">{incomeCategories.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incomeCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-3 rounded-lg border border-border/40 p-3 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {category.color && (
                        <div
                          className="h-[18px] w-[18px] rounded-full shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">{category.name}</span>
                        {!category.user_id && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">Default</Badge>
                        )}
                      </div>
                    </div>
                    {category.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                ))}
                {incomeCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground">No income categories yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Expense Categories</CardTitle>
                <Badge variant="secondary" className="text-xs">{expenseCategories.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenseCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-3 rounded-lg border border-border/40 p-3 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {category.color && (
                        <div
                          className="h-[18px] w-[18px] rounded-full shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">{category.name}</span>
                        {!category.user_id && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">Default</Badge>
                        )}
                      </div>
                    </div>
                    {category.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                ))}
                {expenseCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground">No expense categories yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
