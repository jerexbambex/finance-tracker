import { useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
  onDone: () => void;
  onCancel: () => void;
}

// Shared by the dashboard's "Quick Add" button and the mobile FAB, so the
// fast-entry flow (and its validation) only exists in one place.
export default function QuickAddTransactionForm({ accounts, categories, onDone, onCancel }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    account_id: accounts[0]?.id ?? '',
    category_id: '',
    type: 'expense',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const filteredCategories = categories.filter((cat) => cat.type === data.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/transactions', {
      onSuccess: () => {
        reset();
        onDone();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* One tap to switch type, instead of opening a select — this is the
          field every entry starts with. */}
      <ToggleGroup
        type="single"
        variant="outline"
        value={data.type}
        onValueChange={(value) => value && setData((prev) => ({ ...prev, type: value, category_id: '' }))}
        className="w-full"
      >
        <ToggleGroupItem value="expense" className="flex-1 h-11 data-[state=on]:bg-red-500/10 data-[state=on]:text-red-600">
          Expense
        </ToggleGroupItem>
        <ToggleGroupItem value="income" className="flex-1 h-11 data-[state=on]:bg-green-500/10 data-[state=on]:text-green-600">
          Income
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Big, numeric-keypad-friendly, autofocused — the second thing anyone
          typing on a phone wants to do after picking the type. */}
      <div>
        <Label htmlFor="qa-amount" className="sr-only">Amount</Label>
        <Input
          id="qa-amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          autoFocus
          value={data.amount}
          onChange={(e) => setData('amount', e.target.value)}
          placeholder="0.00"
          className={`h-14 text-center text-3xl font-mono tabular-nums ${errors.amount ? 'border-red-500' : ''}`}
        />
        {errors.amount && <p className="text-red-500 text-sm mt-1 text-center">{errors.amount}</p>}
      </div>

      <div>
        <Label htmlFor="qa-description">Description</Label>
        <Input
          id="qa-description"
          value={data.description}
          onChange={(e) => setData('description', e.target.value)}
          placeholder="e.g., Grocery shopping"
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="qa-account">Account</Label>
          <Select value={data.account_id} onValueChange={(value) => setData('account_id', value)}>
            <SelectTrigger id="qa-account" className={`h-11 w-full ${errors.account_id ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.account_id && <p className="text-red-500 text-sm mt-1">{errors.account_id}</p>}
        </div>

        <div>
          <Label htmlFor="qa-category">Category</Label>
          <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
            <SelectTrigger id="qa-category" className="h-11 w-full">
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="qa-date">Date</Label>
        <Input
          id="qa-date"
          type="date"
          value={data.transaction_date}
          onChange={(e) => setData('transaction_date', e.target.value)}
          className={`h-11 ${errors.transaction_date ? 'border-red-500' : ''}`}
        />
        {errors.transaction_date && <p className="text-red-500 text-sm mt-1">{errors.transaction_date}</p>}
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="outline" className="h-11" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={processing} className="h-11 flex-1">
          {processing ? 'Adding...' : `Add ${data.type === 'income' ? 'Income' : 'Expense'}`}
        </Button>
      </div>
    </form>
  );
}
