import { useMemo } from 'react';
import { calculateTaxReturn } from '../tax-engine';
import type { TaxResult } from '../tax-engine/types';
import { useTaxInput } from './useTaxInput';

export function useTaxCalculation(): TaxResult {
  const input = useTaxInput();
  return useMemo(() => calculateTaxReturn(input), [input]);
}
