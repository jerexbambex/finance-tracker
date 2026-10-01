import { Head, useForm } from '@inertiajs/react';
import { Download, Upload, AlertTriangle, FileArchive } from 'lucide-react';

import { KravioCard } from '@/components/dashboard/KravioCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Data Management',
    href: '/settings/data-management',
  },
];

export default function DataManagement() {
  const { data, setData, post, processing } = useForm({
    file: null as File | null,
  });

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.file) {
      post('/settings/data-management/import');
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Data Management" />

      <SettingsLayout>
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">Data Management & Archival</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Export portable snapshots or restore full financial histories.
            </p>
          </div>

          <KravioCard className="p-5 sm:p-6" pattern>
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
                <FileArchive className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-tight text-foreground">Complete Database Backup</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Export all your accounts, transactions, budgets, goals, recurring schedules, and notes as a structured JSON bundle.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a href="/export/all-data" download>
                <Button size="sm" className="rounded-xl text-xs h-9 px-4 gap-1.5 shadow-sm">
                  <Download className="h-3.5 w-3.5" />
                  Download Complete Archive (.json)
                </Button>
              </a>
            </div>
          </KravioCard>

          <KravioCard className="p-5 sm:p-6" pattern>
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Upload className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-tight text-foreground">Restore From Backup File</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Import data from an existing JSON backup archive.
                </p>
              </div>
            </div>

            <form onSubmit={handleImport} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="file" className="text-xs font-medium text-muted-foreground">Select JSON Backup File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".json"
                  onChange={(e) => setData('file', e.target.files?.[0] || null)}
                  className="rounded-xl text-xs bg-background/80 border-border/70 file:text-xs file:font-semibold file:bg-muted file:rounded-lg file:border-0 file:px-2.5 file:py-1 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Importing merges new records into your workspace. Existing IDs will be preserved.</span>
              </div>

              <Button type="submit" disabled={!data.file || processing} size="sm" className="rounded-xl text-xs h-9 px-4 gap-1.5 shadow-sm">
                <Upload className="h-3.5 w-3.5" />
                {processing ? 'Restoring Archive...' : 'Begin Restore Process'}
              </Button>
            </form>
          </KravioCard>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}

