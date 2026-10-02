import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Tag } from 'lucide-react';

import { KravioCard } from '@/components/dashboard/KravioCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Categories', href: '/categories' },
  { title: 'Create Category', href: '/categories/create' },
];

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    type: 'expense',
    color: '#6366f1',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/categories');
  };

  const colorOptions = [
    { value: '#ef4444', label: 'Red' },
    { value: '#f97316', label: 'Orange' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#eab308', label: 'Yellow' },
    { value: '#84cc16', label: 'Lime' },
    { value: '#22c55e', label: 'Green' },
    { value: '#10b981', label: 'Emerald' },
    { value: '#14b8a6', label: 'Teal' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#0ea5e9', label: 'Sky' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#6366f1', label: 'Indigo' },
    { value: '#8b5cf6', label: 'Violet' },
    { value: '#a855f7', label: 'Purple' },
    { value: '#d946ef', label: 'Fuchsia' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#f43f5e', label: 'Rose' },
    { value: '#6b7280', label: 'Slate' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Category" />

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/categories"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground shadow-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Create Category
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Classify transactions with colors and types for clean reporting.
            </p>
          </div>
        </div>

        <KravioCard pattern innerClassName="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                Category Name
              </Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g., Subscriptions, Dining, Software"
                className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.name ? 'border-destructive' : 'border-border/70'}`}
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="text-xs font-medium text-muted-foreground">
                  Type
                </Label>
                <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                  <SelectTrigger className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense" className="text-xs">Expense</SelectItem>
                    <SelectItem value="income" className="text-xs">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color" className="text-xs font-medium text-muted-foreground">
                  Badge Color
                </Label>
                <div className="flex gap-2 items-center mt-1.5">
                  <Select value={data.color} onValueChange={(value) => setData('color', value)}>
                    <SelectTrigger className="h-10 rounded-xl text-xs bg-background/80 border-border/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3.5 h-3.5 rounded-full ring-1 ring-border/50"
                              style={{ backgroundColor: option.value }}
                            />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div
                    className="w-10 h-10 rounded-xl border border-border/70 shadow-xs shrink-0"
                    style={{ backgroundColor: data.color }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border/40">
              <Button type="submit" disabled={processing} className="rounded-xl px-5 text-xs font-semibold shadow-xs">
                {processing ? 'Creating...' : 'Create Category'}
              </Button>
              <Button type="button" variant="outline" asChild className="rounded-xl px-4 text-xs border-border/70">
                <Link href="/categories">Cancel</Link>
              </Button>
            </div>
          </form>
        </KravioCard>
      </div>
    </AppLayout>
  );
}
