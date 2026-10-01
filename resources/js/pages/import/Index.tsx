import { Head, Link, useForm } from "@inertiajs/react";
import { Upload, ArrowLeft, FileSpreadsheet, CheckCircle2, HelpCircle } from "lucide-react";

import { KravioCard, KravioCardPattern } from "@/components/dashboard/KravioCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";

interface Account {
  id: string;
  name: string;
  currency?: string;
}

interface Props {
  accounts: Account[];
}

export default function Index({ accounts }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    file: null as File | null,
    account_id: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/import/transactions");
  };

  return (
    <AppLayout>
      <Head title="Import Transactions" />

      <div className="py-6 sm:py-8 space-y-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-3">
            <Link
              href="/transactions"
              className="p-1.5 rounded-lg border border-border/70 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Import Transactions</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Bulk ingest bank statements or exported records directly into your ledger.
              </p>
            </div>
          </div>

          <KravioCard className="p-5 sm:p-6" pattern>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-tight">CSV Template Structure</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ensure your file includes header columns for Date, Description, Amount, Type, and Category.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 border border-border/60 rounded-xl p-3 font-mono text-xs text-foreground overflow-x-auto">
              Date, Description, Amount, Type, Category
            </div>
            <p className="text-[11px] text-muted-foreground font-mono mt-2">
              Example: 2026-10-01, Grocery Store, 45.50, expense, Groceries
            </p>
          </KravioCard>

          <KravioCard className="p-6 sm:p-8" pattern>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="account" className="text-xs font-medium text-muted-foreground">Target Account</Label>
                <Select
                  value={data.account_id}
                  onValueChange={(value) => setData("account_id", value)}
                >
                  <SelectTrigger className={`h-10 rounded-xl text-xs bg-background/80 ${errors.account_id ? 'border-destructive' : 'border-border/70'}`}>
                    <SelectValue placeholder="Select target account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} className="text-xs">
                        {account.name} {account.currency ? `(${account.currency})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.account_id && (
                  <p className="text-xs text-destructive mt-1">{errors.account_id}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="file" className="text-xs font-medium text-muted-foreground">CSV File</Label>
                <div className="border border-dashed border-border/80 rounded-2xl p-5 bg-background/50 hover:bg-muted/20 transition-colors text-center">
                  <input
                    id="file"
                    type="file"
                    accept=".csv,.txt"
                    onChange={(e) => setData("file", e.target.files?.[0] || null)}
                    className="block w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border file:border-border/70 file:text-xs file:font-semibold file:bg-muted/80 file:text-foreground hover:file:bg-muted cursor-pointer text-muted-foreground"
                  />
                  {data.file && (
                    <p className="text-xs font-medium text-primary mt-2 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Selected: {data.file.name} ({(data.file.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
                {errors.file && (
                  <p className="text-xs text-destructive mt-1">{errors.file}</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                <Button
                  type="submit"
                  disabled={processing || !data.file || !data.account_id}
                  className="rounded-xl text-xs h-9 px-5 gap-1.5 shadow-sm"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {processing ? "Importing Data..." : "Upload and Parse CSV"}
                </Button>
                <Link href="/transactions">
                  <Button type="button" variant="ghost" className="rounded-xl text-xs h-9 text-muted-foreground">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </KravioCard>
        </div>
      </div>
    </AppLayout>
  );
}

