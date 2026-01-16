import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
}

export default function CreateSimple({ categories }: Props) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    period_type: 'monthly',
    period_year: currentYear,
    period_month: currentMonth,
  });

  const [errors, setErrors] = useState<any>({});
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    console.log('Submitting form data:', formData);
    console.log('period_year type:', typeof formData.period_year, formData.period_year);
    console.log('period_month type:', typeof formData.period_month, formData.period_month);

    router.post('/budgets', formData, {
      onError: (err) => {
        console.log('Errors:', err);
        setErrors(err);
        setProcessing(false);
      },
      onSuccess: () => {
        setProcessing(false);
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Create Budget" />
      
      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="category_id">Category</Label>
                  <select
                    id="category_id"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
                </div>

                <div>
                  <Label htmlFor="amount">Budget Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                  {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                </div>

                <div>
                  <Label htmlFor="period_year">Year</Label>
                  <Input
                    id="period_year"
                    type="number"
                    value={formData.period_year}
                    onChange={(e) => setFormData({ ...formData, period_year: parseInt(e.target.value) })}
                  />
                  {errors.period_year && <p className="text-red-500 text-sm mt-1">{errors.period_year}</p>}
                </div>

                <div>
                  <Label htmlFor="period_month">Month</Label>
                  <Input
                    id="period_month"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.period_month}
                    onChange={(e) => setFormData({ ...formData, period_month: parseInt(e.target.value) })}
                  />
                  {errors.period_month && <p className="text-red-500 text-sm mt-1">{errors.period_month}</p>}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Creating...' : 'Create Budget'}
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
