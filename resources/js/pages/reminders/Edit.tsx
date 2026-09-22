import { Head, useForm, Link } from '@inertiajs/react';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

interface Category {
  id: string;
  name: string;
}

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  amount: number | null;
  due_date: string;
  is_recurring: boolean;
  frequency: string | null;
}

interface Props {
  reminder: Reminder;
  categories: Category[];
}

export default function Edit({ reminder, categories }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    title: reminder.title,
    description: reminder.description ?? '',
    category_id: reminder.category_id ?? '',
    amount: reminder.amount?.toString() ?? '',
    // due_date comes back as a full ISO timestamp from the date cast; the
    // date input only accepts the yyyy-MM-dd portion.
    due_date: reminder.due_date.slice(0, 10),
    is_recurring: reminder.is_recurring,
    frequency: reminder.frequency ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/reminders/${reminder.id}`);
  };

  return (
    <AppLayout>
      <Head title="Edit Reminder" />

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
                  <Link href="/reminders">Reminders</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Reminder</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Card>
            <CardHeader>
              <CardTitle>Edit Reminder</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="e.g., Electric Bill"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Additional details"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category_id">Category (Optional)</Label>
                  <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount (Optional)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={data.amount}
                    onChange={(e) => setData('amount', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={data.due_date}
                    onChange={(e) => setData('due_date', e.target.value)}
                    className={errors.due_date ? 'border-red-500' : ''}
                  />
                  {errors.due_date && <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_recurring"
                    checked={data.is_recurring}
                    onCheckedChange={(checked) => setData('is_recurring', checked as boolean)}
                  />
                  <Label htmlFor="is_recurring" className="cursor-pointer">
                    Recurring reminder
                  </Label>
                </div>

                {data.is_recurring && (
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={data.frequency} onValueChange={(value) => setData('frequency', value)}>
                      <SelectTrigger className={errors.frequency ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.frequency && <p className="text-red-500 text-sm mt-1">{errors.frequency}</p>}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save Changes'}
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
