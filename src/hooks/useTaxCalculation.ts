import { useMemo } from 'react';
import { useTaxStore } from '../store/useTaxStore';
import { calculateTaxReturn } from '../tax-engine';
import type { TaxInput, TaxResult } from '../tax-engine/types';

export function useTaxCalculation(): TaxResult {
  const store = useTaxStore();

  const input: TaxInput = useMemo(() => ({
    filingStatus: store.filingStatus,
    w2s: store.w2s,
    income1099: {
      nec: store.necs,
      int: store.ints,
      div: store.divs,
      b: store.bs,
      misc: store.miscs,
      r: store.rs,
      s: store.ss,
    },
    deductions: store.deductions,
    realEstateSales: store.realEstateSales,
    brokerage: store.brokerage,
    priorYear: store.priorYear,
  }), [
    store.filingStatus, store.w2s, store.necs, store.ints, store.divs,
    store.bs, store.miscs, store.rs, store.ss, store.deductions,
    store.realEstateSales, store.brokerage, store.priorYear,
  ]);

  return useMemo(() => calculateTaxReturn(input), [input]);
}
