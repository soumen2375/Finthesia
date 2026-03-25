// Drop-in button component — add anywhere in your app
// Usage: <PDFImportButton bankId={bank.id} onImported={fetchData} />
// Or without bankId to import as general transactions:
// <PDFImportButton onImported={triggerRefresh} />

import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { PDFStatementModal } from '@/components/app/PDFStatementModal';

interface Props {
  bankId?: string;
  onImported: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function PDFImportButton({ bankId, onImported, className = '', variant = 'secondary' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center space-x-2 font-bold text-sm transition-all active:scale-95 ${
          variant === 'primary'
            ? 'btn-primary px-5 py-2.5'
            : 'btn-secondary px-5 py-2.5'
        } ${className}`}
      >
        <FileText size={16} />
        <span>Import PDF Statement</span>
      </button>
      <PDFStatementModal
        isOpen={open}
        onClose={() => setOpen(false)}
        bankId={bankId}
        onImported={() => { setOpen(false); onImported(); }}
      />
    </>
  );
}
