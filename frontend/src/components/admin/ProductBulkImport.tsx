'use client';

import { useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { Download, Loader2, Upload } from 'lucide-react';

type ImportRow = {
  line: number;
  sku: string;
  name: string;
  status: 'created' | 'updated' | 'skipped' | 'error';
  message?: string;
};

type ImportResult = {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  rows: ImportRow[];
};

export function ProductBulkImport({ onComplete }: { onComplete?: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const csvRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);

  if (!pathname?.startsWith('/admin/products')) {
    return null;
  }

  const reset = () => {
    setCsvFile(null);
    setZipFile(null);
    setResult(null);
    setError('');
    if (csvRef.current) csvRef.current.value = '';
    if (zipRef.current) zipRef.current.value = '';
  };

  const downloadTemplate = async () => {
    setError('');
    try {
      const blob = await api.downloadProductImportTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products-import.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download template');
    }
  };

  const runImport = async () => {
    if (!csvFile) {
      setError('Choose a CSV file first.');
      return;
    }
    if (
      !confirm(
        `Import ${csvFile.name}${zipFile ? ` with images from ${zipFile.name}` : ''}? This updates the live catalog.`
      )
    ) {
      return;
    }

    setLoading(true);
    setError('');
    const fd = new FormData();
    fd.append('csv', csvFile);
    if (zipFile) fd.append('imagesZip', zipFile);

    try {
      const res = (await api.importProducts(fd, { updateExisting })) as ImportResult;
      setResult(res);
      if (res.created > 0 || res.updated > 0) onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const issues = result?.rows.filter((r) => r.status === 'error' || r.status === 'skipped') ?? [];

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50"
      >
        <Upload className="w-4 h-4" />
        Import CSV
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6 w-full">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Import products from CSV</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Download the template, fill it in Excel, optionally add a ZIP of photos (filenames in the{' '}
            <strong>image</strong> column), then import in one step.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          className="text-sm text-gray-500 hover:text-gray-800 shrink-0"
        >
          Close
        </button>
      </div>

      {error && (
        <p className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">{error}</p>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Download template
        </button>
      </div>

      <div className="space-y-4 mb-4">
        <label className="block text-sm">
          <span className="font-medium text-gray-700">Spreadsheet (CSV) *</span>
          <input
            ref={csvRef}
            type="file"
            accept=".csv"
            className="mt-1 block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100"
            onChange={(e) => {
              setCsvFile(e.target.files?.[0] ?? null);
              setResult(null);
            }}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-gray-700">Photos ZIP (optional)</span>
          <input
            ref={zipRef}
            type="file"
            accept=".zip"
            className="mt-1 block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100"
            onChange={(e) => {
              setZipFile(e.target.files?.[0] ?? null);
              setResult(null);
            }}
          />
        </label>
      </div>

      <label className="flex items-start gap-2 mb-5 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={updateExisting}
          onChange={(e) => setUpdateExisting(e.target.checked)}
          className="mt-1 rounded border-gray-300"
        />
        Update products that already use the same SKU (otherwise skip duplicates)
      </label>

      <button
        type="button"
        disabled={loading || !csvFile}
        onClick={runImport}
        className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        Import products
      </button>

      {result && (
        <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm">
          <p className="font-medium text-gray-900 mb-2">Import finished</p>
          <p className="text-gray-600">
            {result.created} created · {result.updated} updated · {result.skipped} skipped ·{' '}
            <span className={result.failed ? 'text-red-600 font-medium' : ''}>{result.failed} failed</span>{' '}
            (of {result.total} rows)
          </p>
          {issues.length > 0 && (
            <ul className="mt-3 max-h-48 overflow-y-auto space-y-1.5 text-xs text-gray-600 border-t border-gray-200 pt-3">
              {issues.map((row) => (
                <li key={`${row.line}-${row.sku}`}>
                  <span className="font-mono">{row.sku}</span> (line {row.line}): {row.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
