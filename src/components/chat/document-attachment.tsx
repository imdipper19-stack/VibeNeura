'use client';

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';

export function DocumentAttachment({
  filename,
  markdown,
  ready,
}: {
  filename: string;
  markdown: string;
  ready: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!ready || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/document/export', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filename, markdown }),
      });
      if (!res.ok) {
        console.error('document export failed', res.status);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!ready || loading}
      className="mt-2 group flex w-full max-w-sm items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-left transition-all hover:border-primary/60 hover:bg-primary/10 disabled:opacity-60"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-on-surface">{filename}</div>
        <div className="text-[11px] text-on-surface-variant">
          {ready ? 'Word документ — нажмите чтобы скачать' : 'Генерируем…'}
        </div>
      </div>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <Download className="h-4 w-4 text-primary opacity-70 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}
