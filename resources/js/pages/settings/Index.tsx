import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload } from 'lucide-react';

export default function Index() {
  const { data, setData, post, processing } = useForm({
    file: null as File | null,
  });

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.file) {
      post('/settings/import');
    }
  };

  return (
    <AppLayout>
      <Head title="Settings" />
      
      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Backup</CardTitle>
                <CardDescription>
                  Export all your financial data as a JSON file for backup purposes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a href="/export/all-data">
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
        </div>
      </div>
    </AppLayout>
  );
}
