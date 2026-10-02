import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Bell } from 'lucide-react';

import { KravioCard } from '@/components/dashboard/KravioCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Reminders', href: '/reminders' },
  { title: 'Create Reminder', href: '/reminders/create' },
];

export default function Create({ categories }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    category_id: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    frequency: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/reminders');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Reminder" />

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/reminders"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground shadow-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Create Reminder
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Keep track of upcoming bills, loan due dates, and financial deadlines.
            </p>
          </div>
        </div>

        <KravioCard pattern innerClassName="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-xs font-medium text-muted-foreground">
                Reminder Title
              </Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="e.g., Electric Bill, Car Insurance, Tax Filing"
                className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.title ? 'border-destructive' : 'border-border/70'}`}
              />
              {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category_id" className="text-xs font-medium text-muted-foreground">
                  Category (Optional)
                </Label>
                <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                  <SelectTrigger className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-xs">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
                  Expected Amount (Optional)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={data.amount}
                  onChange={(e) => setData('amount', e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5 h-10 font-mono text-sm rounded-xl bg-background/80 border-border/70"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="due_date" className="text-xs font-medium text-muted-foreground">
                Due Date
              </Label>
              <Input
                id="due_date"
                type="date"
                value={data.due_date}
                onChange={(e) => setData('due_date', e.target.value)}
                className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.due_date ? 'border-destructive' : 'border-border/70'}`}
              />
              {errors.due_date && <p className="text-destructive text-xs mt-1">{errors.due_date}</p>}
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_recurring"
                  checked={data.is_recurring}
                  onCheckedChange={(checked) => setData('is_recurring', checked as boolean)}
                />
                <Label htmlFor="is_recurring" className="text-xs font-medium cursor-pointer">
                  Repeat this reminder on a regular schedule
                </Label>
              </div>

              {data.is_recurring && (
                <div className="pt-2">
                  <Label htmlFor="frequency" className="text-xs font-medium text-muted-foreground">
                    Repeat Frequency
                  </Label>
                  <Select value={data.frequency} onValueChange={(value) => setData('frequency', value)}>
                    <SelectTrigger className="mt-1.5 h-10 rounded-xl text-xs bg-background border-border/70">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
                      <SelectItem value="yearly" className="text-xs">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
                Notes / Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Additional details or reference numbers"
                rows={3}
                className="mt-1.5 rounded-xl text-xs bg-background/80 border-border/70"
              />
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border/40">
              <Button type="submit" disabled={processing} className="rounded-xl px-5 text-xs font-semibold shadow-xs">
                {processing ? 'Creating...' : 'Create Reminder'}
              </Button>
              <Button type="button" variant="outline" asChild className="rounded-xl px-4 text-xs border-border/70">
                <Link href="/reminders">Cancel</Link>
              </Button>
            </div>
          </form>
        </KravioCard>
      </div>
    </AppLayout>
  );
}
