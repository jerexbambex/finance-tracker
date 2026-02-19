import { Head, useForm } from "@inertiajs/react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { Account } from "@/types";

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

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Import Transactions</h1>
          <p className="text-muted-foreground">
            Upload a CSV file to import transactions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>CSV Format</CardTitle>
            <CardDescription>
              Your CSV file should have the following columns:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md font-mono text-sm">
              Date, Description, Amount, Type, Category (optional)
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Example: 2024-01-15, Grocery Shopping, 45.50, expense, Food
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Select
                  value={data.account_id}
                  onValueChange={(value) => setData("account_id", value)}
                >
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
                {errors.account_id && (
                  <p className="text-sm text-destructive">{errors.account_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">CSV File</Label>
                <input
                  id="file"
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => setData("file", e.target.files?.[0] || null)}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {errors.file && (
                  <p className="text-sm text-destructive">{errors.file}</p>
                )}
              </div>

              <Button type="submit" disabled={processing || !data.file || !data.account_id}>
                <Upload className="mr-2 h-4 w-4" />
                {processing ? "Importing..." : "Import Transactions"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
