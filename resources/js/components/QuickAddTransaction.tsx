import { Plus } from 'lucide-react';
import { useState } from 'react';

import QuickAddTransactionForm from '@/components/quick-add/QuickAddTransactionForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

export default function QuickAddTransaction({ accounts, categories }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Quick Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Add Transaction</DialogTitle>
        </DialogHeader>
        <QuickAddTransactionForm
          accounts={accounts}
          categories={categories}
          onDone={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
