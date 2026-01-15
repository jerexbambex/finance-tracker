import { Head, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Props {
  accounts: Account[];
  categories: Category[];
}

export default function Create({ accounts, categories }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    account_id: "",
    category_id: "",
    type: "expense",
    amount: "",
    description: "",
    frequency: "monthly",
    next_due_date: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/recurring-transactions");
  };

  const filteredCategories = categories.filter((c) => c.type === data.type);

  return (
    <AppLayout>
      <Head title="New Recurring Transaction" />

      <div className="py-6 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">New Recurring Transaction</h1>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={data.type} onValueChange={(value) => setData("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    placeholder="e.g., Netflix Subscription"
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={data.amount}
                    onChange={(e) => setData("amount", e.target.value)}
                    placeholder="0.00"
                  />
                  {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account">Account</Label>
                  <Select value={data.account_id} onValueChange={(value) => setData("account_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.account_id && <p className="text-sm text-destructive">{errors.account_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={data.category_id} onValueChange={(value) => setData("category_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={data.frequency} onValueChange={(value) => setData("frequency", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.frequency && <p className="text-sm text-destructive">{errors.frequency}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="next_due_date">Next Due Date</Label>
                  <Input
                    id="next_due_date"
                    type="date"
                    value={data.next_due_date}
                    onChange={(e) => setData("next_due_date", e.target.value)}
                  />
                  {errors.next_due_date && <p className="text-sm text-destructive">{errors.next_due_date}</p>}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={processing}>
                    {processing ? "Creating..." : "Create Recurring Transaction"}
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
