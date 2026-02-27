import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  FilingStatus, W2Entry, Form1099NECEntry, Form1099INTEntry,
  Form1099DIVEntry, Form1099BEntry, Form1099MISCEntry, Form1099REntry,
  Form1099SEntry, RealEstateSaleEntry, DeductionInputs, PriorYearData,
  BrokerageData,
} from '../tax-engine/types';

export interface TaxStore {
  // Filing Status
  filingStatus: FilingStatus;
  setFilingStatus: (status: FilingStatus) => void;

  // W-2s
  w2s: W2Entry[];
  addW2: (entry: W2Entry) => void;
  updateW2: (id: string, entry: Partial<W2Entry>) => void;
  removeW2: (id: string) => void;

  // 1099-NEC
  necs: Form1099NECEntry[];
  addNec: (entry: Form1099NECEntry) => void;
  updateNec: (id: string, entry: Partial<Form1099NECEntry>) => void;
  removeNec: (id: string) => void;

  // 1099-INT
  ints: Form1099INTEntry[];
  addInt: (entry: Form1099INTEntry) => void;
  updateInt: (id: string, entry: Partial<Form1099INTEntry>) => void;
  removeInt: (id: string) => void;

  // 1099-DIV
  divs: Form1099DIVEntry[];
  addDiv: (entry: Form1099DIVEntry) => void;
  updateDiv: (id: string, entry: Partial<Form1099DIVEntry>) => void;
  removeDiv: (id: string) => void;

  // 1099-B
  bs: Form1099BEntry[];
  addB: (entry: Form1099BEntry) => void;
  updateB: (id: string, entry: Partial<Form1099BEntry>) => void;
  removeB: (id: string) => void;

  // 1099-MISC
  miscs: Form1099MISCEntry[];
  addMisc: (entry: Form1099MISCEntry) => void;
  updateMisc: (id: string, entry: Partial<Form1099MISCEntry>) => void;
  removeMisc: (id: string) => void;

  // 1099-R
  rs: Form1099REntry[];
  addR: (entry: Form1099REntry) => void;
  updateR: (id: string, entry: Partial<Form1099REntry>) => void;
  removeR: (id: string) => void;

  // 1099-S
  ss: Form1099SEntry[];
  addS: (entry: Form1099SEntry) => void;
  updateS: (id: string, entry: Partial<Form1099SEntry>) => void;
  removeS: (id: string) => void;

  // Deductions
  deductions: DeductionInputs;
  setDeductions: (deductions: Partial<DeductionInputs>) => void;

  // Real Estate
  realEstateSales: RealEstateSaleEntry[];
  addRealEstate: (entry: RealEstateSaleEntry) => void;
  updateRealEstate: (id: string, entry: Partial<RealEstateSaleEntry>) => void;
  removeRealEstate: (id: string) => void;

  // Brokerage
  brokerage: BrokerageData;
  setBrokerage: (data: Partial<BrokerageData>) => void;

  // Prior Year
  priorYear: PriorYearData;
  setPriorYear: (data: Partial<PriorYearData>) => void;

  // Wizard
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Reset
  resetAll: () => void;
}

const defaultDeductions: DeductionInputs = {
  type: 'standard',
  mortgageInterest: 0,
  stateLocalTaxesPaid: 0,
  charitableContributions: 0,
  medicalExpenses: 0,
};

const defaultBrokerage: BrokerageData = {
  totalRealizedGains: 0,
  totalRealizedLosses: 0,
  totalDividends: 0,
  totalInterest: 0,
  washSaleAdjustments: 0,
};

const defaultPriorYear: PriorYearData = {
  agi: 0,
  refundOrOwed: 0,
  estimatedPaymentsMade: 0,
  capitalLossCarryforward: 0,
};

function makeListActions<T extends { id: string }>(
  set: (fn: (state: TaxStore) => Partial<TaxStore>) => void,
  key: keyof TaxStore
) {
  return {
    add: (entry: T) =>
      set((state) => ({ [key]: [...(state[key] as T[]), entry] } as Partial<TaxStore>)),
    update: (id: string, update: Partial<T>) =>
      set((state) => ({
        [key]: (state[key] as T[]).map((item) =>
          item.id === id ? { ...item, ...update } : item
        ),
      } as Partial<TaxStore>)),
    remove: (id: string) =>
      set((state) => ({
        [key]: (state[key] as T[]).filter((item) => item.id !== id),
      } as Partial<TaxStore>)),
  };
}

export const useTaxStore = create<TaxStore>()(
  persist(
    (set) => {
      const w2Actions = makeListActions<W2Entry>(set, 'w2s');
      const necActions = makeListActions<Form1099NECEntry>(set, 'necs');
      const intActions = makeListActions<Form1099INTEntry>(set, 'ints');
      const divActions = makeListActions<Form1099DIVEntry>(set, 'divs');
      const bActions = makeListActions<Form1099BEntry>(set, 'bs');
      const miscActions = makeListActions<Form1099MISCEntry>(set, 'miscs');
      const rActions = makeListActions<Form1099REntry>(set, 'rs');
      const sActions = makeListActions<Form1099SEntry>(set, 'ss');
      const reActions = makeListActions<RealEstateSaleEntry>(set, 'realEstateSales');

      return {
        filingStatus: 'single',
        setFilingStatus: (status) => set({ filingStatus: status }),

        w2s: [],
        addW2: w2Actions.add,
        updateW2: w2Actions.update,
        removeW2: w2Actions.remove,

        necs: [],
        addNec: necActions.add,
        updateNec: necActions.update,
        removeNec: necActions.remove,

        ints: [],
        addInt: intActions.add,
        updateInt: intActions.update,
        removeInt: intActions.remove,

        divs: [],
        addDiv: divActions.add,
        updateDiv: divActions.update,
        removeDiv: divActions.remove,

        bs: [],
        addB: bActions.add,
        updateB: bActions.update,
        removeB: bActions.remove,

        miscs: [],
        addMisc: miscActions.add,
        updateMisc: miscActions.update,
        removeMisc: miscActions.remove,

        rs: [],
        addR: rActions.add,
        updateR: rActions.update,
        removeR: rActions.remove,

        ss: [],
        addS: sActions.add,
        updateS: sActions.update,
        removeS: sActions.remove,

        deductions: defaultDeductions,
        setDeductions: (d) => set((state) => ({ deductions: { ...state.deductions, ...d } })),

        realEstateSales: [],
        addRealEstate: reActions.add,
        updateRealEstate: reActions.update,
        removeRealEstate: reActions.remove,

        brokerage: defaultBrokerage,
        setBrokerage: (d) => set((state) => ({ brokerage: { ...state.brokerage, ...d } })),

        priorYear: defaultPriorYear,
        setPriorYear: (d) => set((state) => ({ priorYear: { ...state.priorYear, ...d } })),

        currentStep: 0,
        setCurrentStep: (step) => set({ currentStep: step }),

        resetAll: () => set({
          filingStatus: 'single',
          w2s: [],
          necs: [], ints: [], divs: [], bs: [], miscs: [], rs: [], ss: [],
          deductions: defaultDeductions,
          realEstateSales: [],
          brokerage: defaultBrokerage,
          priorYear: defaultPriorYear,
          currentStep: 0,
        }),
      };
    },
    {
      name: 'tax-app-storage',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version < 2) {
          // Upload step was inserted at index 0, shift existing step forward
          state.currentStep = ((state.currentStep as number) || 0) + 1;
        }
        return state as TaxStore;
      },
    }
  )
);
