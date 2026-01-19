import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import AccountLayout from '@/layouts/account/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Management',
        href: '/account/data-management',
    },
];

export default function DataManagement() {
  const { data, setData, post, processing } = useForm({
    file: null as File | null,
  });

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.file) {
      post('/account/data-management/import');
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Data Management" />
      
      <AccountLayout>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Data Management</h3>
            <p className="text-sm text-muted-foreground">
              Export and import your financial data
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Backup</CardTitle>
              <CardDescription>
                Export all your financial data as a JSON file for backup purposes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/export/all-data" download>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                Includes accounts, transactions, budgets, goals, and reminders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Restore</CardTitle>
              <CardDescription>
                Import data from a previously exported backup file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleImport} className="space-y-4">
                <div>
                  <Label htmlFor="file">Backup File (JSON)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".json"
                    onChange={(e) => setData('file', e.target.files?.[0] || null)}
                  />
                </div>
                <Button type="submit" disabled={!data.file || processing}>
                  <Upload className="h-4 w-4 mr-2" />
                  {processing ? 'Importing...' : 'Import Data'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Warning: This will add the imported data to your existing data
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </AccountLayout>
    </AppLayout>
  );
}
