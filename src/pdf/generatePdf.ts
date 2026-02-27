import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import { TaxReturnDocument } from './TaxReturnDocument';
import type { TaxInput, TaxResult } from '../tax-engine/types';

export async function generatePdf(input: TaxInput, result: TaxResult): Promise<void> {
  const doc = createElement(TaxReturnDocument, { input, result });
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `2025-Tax-Summary-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
