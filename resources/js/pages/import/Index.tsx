import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, ArrowLeft, CheckCircle2, FileSpreadsheet, Loader2, Upload, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { KravioCard } from '@/components/dashboard/KravioCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatCurrency';
import { type BreadcrumbItem } from '@/types';

interface Account {
  id: string;
  name: string;
  currency: string;
}

interface Props {
  accounts: Account[];
  importErrors: string[];
}

type Field = 'date' | 'description' | 'amount' | 'debit' | 'credit' | 'type' | 'category';
type DateOrder = 'ymd' | 'dmy' | 'mdy';
type Mapping = Record<Field, number | null>;

interface Settings {
  has_header: boolean;
  mapping: Mapping;
  date_order: DateOrder;
  positive_is_expense: boolean;
}

type PreviewRow =
  | {
      line: number;
      ok: true;
      date: string;
      description: string;
      amount: number;
      type: 'income' | 'expense';
      category: string | null;
      /** Already in the account; only present when an account is selected. */
      duplicate?: boolean;
    }
  | { line: number; ok: false; error: string };

interface Preview {
  columns: string[];
  guess: { date_order_certain: boolean };
  settings: Settings;
  rows: PreviewRow[];
  summary: { total: number; valid: number; invalid: number; duplicates: number };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Transactions', href: '/transactions' },
  { title: 'Import CSV', href: '/import/transactions' },
];

const FIELDS: { key: Field; label: string; hint: string; required?: boolean }[] = [
  { key: 'date', label: 'Date', hint: 'When it happened', required: true },
  { key: 'description', label: 'Description', hint: 'Payee, narration or memo', required: true },
  { key: 'amount', label: 'Amount', hint: 'One column, negative = money out' },
  { key: 'debit', label: 'Debit / Money out', hint: 'If your bank splits amounts' },
  { key: 'credit', label: 'Credit / Money in', hint: 'If your bank splits amounts' },
  { key: 'type', label: 'Type', hint: 'e.g. "debit", "credit", "expense"' },
  { key: 'category', label: 'Category', hint: 'Optional — otherwise we suggest one' },
];

const DATE_ORDERS: { id: DateOrder; label: string }[] = [
  { id: 'dmy', label: 'Day first — 31/01/2026' },
  { id: 'mdy', label: 'Month first — 01/31/2026' },
  { id: 'ymd', label: 'Year first — 2026-01-31' },
];

const NONE = '__none__';

/** Same bank, same headers: a saved mapping is keyed by the header row. */
const storageKey = (columns: string[]) => `import-mapping:${columns.join('|').toLowerCase()}`;

function loadSaved(columns: string[]): Settings | null {
  try {
    const raw = localStorage.getItem(storageKey(columns));
    return raw ? (JSON.parse(raw) as Settings) : null;
  } catch {
    return null;
  }
}

function save(columns: string[], settings: Settings) {
  try {
    localStorage.setItem(storageKey(columns), JSON.stringify(settings));
  } catch {
    // Private mode / storage blocked: the user just maps again next time.
  }
}

function toFormData(file: File, accountId: string, settings: Settings | null): FormData {
  const form = new FormData();
  form.append('file', file);
  if (accountId) form.append('account_id', accountId);
  if (settings) {
    form.append('has_header', settings.has_header ? '1' : '0');
    form.append('date_order', settings.date_order);
    form.append('positive_is_expense', settings.positive_is_expense ? '1' : '0');
    (Object.keys(settings.mapping) as Field[]).forEach((field) => {
      form.append(`mapping[${field}]`, settings.mapping[field] === null ? '' : String(settings.mapping[field]));
    });
  }
  return form;
}

export default function Index({ accounts, importErrors }: Props) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [importing, setImporting] = useState(false);
  const requestId = useRef(0);

  const currency = accounts.find((a) => a.id === accountId)?.currency ?? 'USD';

  // Re-run the preview whenever the file, account or any mapping choice changes.
  useEffect(() => {
    if (!file) return;
    const id = ++requestId.current;
    const timer = setTimeout(() => {
      setLoading(true);
      axios
        .post<Preview>('/import/transactions/preview', toFormData(file, accountId, settings))
        .then(({ data }) => {
          if (id !== requestId.current) return;
          setError(null);
          setPreview(data);
          if (settings) return;

          // First look at this file: prefer a mapping saved for these exact headers,
          // then the server's guess. Ambiguous dates default to the browser's locale.
          const saved = data.settings.has_header ? loadSaved(data.columns) : null;
          if (saved) {
            setRestored(true);
            setSettings(saved);
          } else {
            const order = !data.guess.date_order_certain && data.settings.date_order !== 'ymd' && navigator.language === 'en-US'
              ? 'mdy'
              : data.settings.date_order;
            setRestored(false);
            setSettings({ ...data.settings, date_order: order });
          }
        })
        .catch((err) => {
          if (id !== requestId.current) return;
          const errors = err?.response?.data?.errors as Record<string, string[]> | undefined;
          setError(errors ? Object.values(errors).flat()[0] : 'Could not read this file. Is it a CSV?');
        })
        .finally(() => id === requestId.current && setLoading(false));
    }, settings ? 300 : 0);

    return () => clearTimeout(timer);
  }, [file, accountId, settings]);

  const chooseFile = (next: File | null) => {
    setFile(next);
    setSettings(null);
    setPreview(null);
    setError(null);
  };

  const setMapping = (field: Field, value: string) =>
    settings && setSettings({ ...settings, mapping: { ...settings.mapping, [field]: value === NONE ? null : Number(value) } });

  const handleImport = () => {
    if (!file || !settings || !preview) return;
    if (settings.has_header) save(preview.columns, settings);
    router.post('/import/transactions', toFormData(file, accountId, settings), {
      forceFormData: true,
      onStart: () => setImporting(true),
      onFinish: () => setImporting(false),
      onSuccess: () => chooseFile(null),
    });
  };

  const mapping = settings?.mapping;
  const usesSignedAmount = mapping && mapping.amount !== null && mapping.type === null && mapping.debit === null && mapping.credit === null;
  const dateUncertain = preview && !preview.guess.date_order_certain && settings?.date_order !== 'ymd' && !restored;
  const toImport = preview?.summary.valid ?? 0;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Import Transactions" />

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/transactions"
            aria-label="Back to transactions"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground shadow-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Import Transactions</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Upload a CSV statement from any bank. We&rsquo;ll match the columns — you check the preview before anything is saved.
            </p>
          </div>
        </div>

        {importErrors.length > 0 && (
          <KravioCard innerClassName="p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">Some rows in your last import couldn&rsquo;t be read</p>
                <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground font-mono">
                  {importErrors.map((e) => (
                    <li key={e} className="truncate">{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          </KravioCard>
        )}

        {accounts.length === 0 && (
          <KravioCard innerClassName="p-5 text-sm">
            You need an account to import into.{' '}
            <Link href="/accounts/create" className="font-semibold text-primary hover:underline">
              Create one first
            </Link>
            .
          </KravioCard>
        )}

        {/* Step 1 — account and file */}
        <KravioCard pattern innerClassName="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Import into account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id} className="text-xs">
                      {account.name} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="file" className="text-xs font-medium text-muted-foreground">CSV file</Label>
              <label
                htmlFor="file"
                className="mt-1.5 flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border/80 bg-background/50 px-3 text-xs hover:bg-muted/30 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate text-muted-foreground">
                  {file ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)` : 'Choose a .csv file…'}
                </span>
              </label>
              <input
                id="file"
                type="file"
                accept=".csv,.txt,text/csv"
                className="sr-only"
                onChange={(e) => {
                  chooseFile(e.target.files?.[0] ?? null);
                  e.target.value = ''; // so picking the same file again still triggers a change
                }}
              />
            </div>
          </div>
          {error && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-destructive">
              <XCircle className="h-3.5 w-3.5" /> {error}
            </p>
          )}
        </KravioCard>

        {/* Step 2 — mapping */}
        {preview && settings && mapping && (
          <KravioCard innerClassName="p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold tracking-tight">Match your columns</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {restored
                    ? 'Using the mapping you saved last time for this bank’s format.'
                    : 'We guessed from the headers. Adjust anything that looks wrong — the preview updates as you go.'}
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <Switch
                  checked={settings.has_header}
                  onCheckedChange={(v) => setSettings({ ...settings, has_header: v })}
                />
                First row is headers
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FIELDS.map((field) => (
                <div key={field.key}>
                  <Label className="text-xs font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </Label>
                  <Select value={mapping[field.key] === null ? NONE : String(mapping[field.key])} onValueChange={(v) => setMapping(field.key, v)}>
                    <SelectTrigger className="mt-1 h-9 rounded-lg text-xs bg-background/80 border-border/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE} className="text-xs text-muted-foreground">— Not in file —</SelectItem>
                      {preview.columns.map((col, i) => (
                        <SelectItem key={i} value={String(i)} className="text-xs">
                          {col || `Column ${i + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{field.hint}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border/40 pt-4">
              <div>
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  Date format
                  {dateUncertain && (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3 w-3" /> Please confirm
                    </span>
                  )}
                </Label>
                <Select value={settings.date_order} onValueChange={(v) => setSettings({ ...settings, date_order: v as DateOrder })}>
                  <SelectTrigger className="mt-1 h-9 rounded-lg text-xs bg-background/80 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_ORDERS.map((o) => (
                      <SelectItem key={o.id} value={o.id} className="text-xs">{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {dateUncertain && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Every date in this file works either way (e.g. 03/04 could be 3 April or March 4). Check the preview.
                  </p>
                )}
              </div>
              {usesSignedAmount && (
                <label className="flex items-start gap-2 text-xs self-center">
                  <Switch
                    checked={settings.positive_is_expense}
                    onCheckedChange={(v) => setSettings({ ...settings, positive_is_expense: v })}
                  />
                  <span>
                    Positive amounts are spending
                    <span className="block text-[11px] text-muted-foreground">Common on credit card statements</span>
                  </span>
                </label>
              )}
            </div>
          </KravioCard>
        )}

        {/* Step 3 — preview and import */}
        {preview && (
          <KravioCard innerClassName="p-0 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  {toImport} to import
                </span>
                {preview.summary.duplicates > 0 && (
                  <span className="text-muted-foreground">{preview.summary.duplicates} already imported (skipped)</span>
                )}
                {preview.summary.invalid > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">{preview.summary.invalid} can&rsquo;t be read</span>
                )}
              </div>
              <Button
                onClick={handleImport}
                disabled={importing || loading || toImport === 0 || !accountId}
                className="rounded-xl text-xs px-5 font-semibold gap-1.5"
              >
                {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {importing ? 'Importing…' : `Import ${toImport} transaction${toImport === 1 ? '' : 's'}`}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium w-12">Row</th>
                    <th className="px-4 py-2 text-left font-medium">Date</th>
                    <th className="px-4 py-2 text-left font-medium">Description</th>
                    <th className="px-4 py-2 text-left font-medium">Category</th>
                    <th className="px-4 py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                  {preview.rows.map((row) =>
                    row.ok ? (
                      <tr key={row.line} className={`border-t border-border/40 ${row.duplicate ? 'text-muted-foreground opacity-60' : ''}`}>
                        <td className="px-4 py-2 text-muted-foreground font-mono">{row.line}</td>
                        <td className="px-4 py-2 font-mono whitespace-nowrap">
                          {new Date(`${row.date}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-2 max-w-[18rem] truncate">
                          {row.description}
                          {row.duplicate && (
                            <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">Already imported</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">{row.category ?? 'Auto'}</td>
                        <td
                          className={`px-4 py-2 text-right font-mono tabular-nums whitespace-nowrap ${
                            row.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                          }`}
                        >
                          {row.type === 'income' ? '+' : '−'}
                          {formatCurrency(row.amount, currency)}
                        </td>
                      </tr>
                    ) : (
                      <tr key={row.line} className="border-t border-border/40 bg-destructive/5">
                        <td className="px-4 py-2 text-muted-foreground font-mono">{row.line}</td>
                        <td colSpan={4} className="px-4 py-2 text-destructive">
                          <span className="inline-flex items-center gap-1.5">
                            <XCircle className="h-3.5 w-3.5" /> {row.error} — this row will be skipped
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
            {preview.summary.total > preview.rows.length && (
              <p className="border-t border-border/40 px-5 py-2.5 text-[11px] text-muted-foreground">
                Showing the first {preview.rows.length} of {preview.summary.total} rows.
              </p>
            )}
          </KravioCard>
        )}
      </div>
    </AppLayout>
  );
}
