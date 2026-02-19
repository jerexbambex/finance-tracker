import { Head, useForm, Link } from '@inertiajs/react';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

interface Goal {
  id: string;
  name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category: string | null;
}

interface Props {
  goal: Goal;
}

export default function Edit({ goal }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: goal.name,
    description: goal.description || '',
    target_amount: goal.target_amount.toString(),
    current_amount: goal.current_amount.toString(),
    target_date: goal.target_date || '',
    category: goal.category || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/goals/${goal.id}`);
  };

  return (
    <AppLayout>
      <Head title="Edit Goal" />
      
      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/goals">Goals</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Goal</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <Card>
            <CardHeader>
              <CardTitle>Edit Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g., Emergency Fund"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    value={data.category}
                    onChange={(e) => setData('category', e.target.value)}
                    placeholder="e.g., Savings, Vacation, House"
                  />
                </div>

                <div>
                  <Label htmlFor="target_amount">Target Amount</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    step="0.01"
                    value={data.target_amount}
                    onChange={(e) => setData('target_amount', e.target.value)}
                    placeholder="0.00"
                    className={errors.target_amount ? 'border-red-500' : ''}
                  />
                  {errors.target_amount && <p className="text-red-500 text-sm mt-1">{errors.target_amount}</p>}
                </div>

                <div>
                  <Label htmlFor="current_amount">Current Amount</Label>
                  <Input
                    id="current_amount"
                    type="number"
                    step="0.01"
                    value={data.current_amount}
                    onChange={(e) => setData('current_amount', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="target_date">Target Date (Optional)</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={data.target_date}
                    onChange={(e) => setData('target_date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="What is this goal for?"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Updating...' : 'Update Goal'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
