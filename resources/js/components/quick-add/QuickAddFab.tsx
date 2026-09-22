import { usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import QuickAddTransactionForm from '@/components/quick-add/QuickAddTransactionForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface QuickAddShared {
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; type: string }[];
}

// A persistent, one-thumb-reachable way to log a transaction from any
// authenticated page on a phone — not just from the dashboard's header
// button, which the desktop-sized "Quick Add" trigger doesn't really serve
// well on a small screen. Desktop already has that header button on the
// dashboard, so this only renders below the md breakpoint.
export default function QuickAddFab() {
  const [open, setOpen] = useState(false);
  const { quickAdd } = usePage().props as { quickAdd?: QuickAddShared | null };

  if (!quickAdd || quickAdd.accounts.length === 0) {
    return null; // nothing to log against yet (e.g. brand new account, or logged out)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Quick add transaction"
        className="md:hidden fixed z-40 right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </button>

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Add Transaction</DialogTitle>
        </DialogHeader>
        <QuickAddTransactionForm
          accounts={quickAdd.accounts}
          categories={quickAdd.categories}
          onDone={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
