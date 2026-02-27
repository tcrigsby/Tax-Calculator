export type FilingStatus =
  | 'single'
  | 'married_filing_jointly'
  | 'married_filing_separately'
  | 'head_of_household'
  | 'qualifying_surviving_spouse';

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  married_filing_jointly: 'Married Filing Jointly',
  married_filing_separately: 'Married Filing Separately',
  head_of_household: 'Head of Household',
  qualifying_surviving_spouse: 'Qualifying Surviving Spouse',
};

// ---- Input Types ----

export interface W2Entry {
  id: string;
  employerName: string;
  wages: number;
  federalWithheld: number;
  stateWithheld: number;
  socialSecurityWages: number;
  medicareWages: number;
}

export interface Form1099NECEntry {
  id: string;
  payerName: string;
  nonemployeeCompensation: number;
}

export interface Form1099INTEntry {
  id: string;
  payerName: string;
  interestIncome: number;
}

export interface Form1099DIVEntry {
  id: string;
  payerName: string;
  ordinaryDividends: number;
  qualifiedDividends: number;
}

export interface Form1099BEntry {
  id: string;
  description: string;
  proceeds: number;
  costBasis: number;
  gainLoss: number;
  isLongTerm: boolean;
  washSaleDisallowed: number;
}

export interface Form1099MISCEntry {
  id: string;
  payerName: string;
  otherIncome: number;
}

export interface Form1099REntry {
  id: string;
  payerName: string;
  grossDistribution: number;
  taxableAmount: number;
  federalWithheld: number;
}

export interface Form1099SEntry {
  id: string;
  propertyAddress: string;
  grossProceeds: number;
}

export interface RealEstateSaleEntry {
  id: string;
  propertyDescription: string;
  purchasePrice: number;
  salePrice: number;
  improvements: number;
  depreciation: number;
  holdingPeriodMonths: number;
  isPrimaryResidence: boolean;
  meetsTwoOfFiveYearTest: boolean;
}

export interface DeductionInputs {
  type: 'standard' | 'itemized';
  mortgageInterest: number;
  stateLocalTaxesPaid: number;
  charitableContributions: number;
  medicalExpenses: number;
}

export interface PriorYearData {
  agi: number;
  refundOrOwed: number;
  estimatedPaymentsMade: number;
  capitalLossCarryforward: number;
}

export interface BrokerageData {
  totalRealizedGains: number;
  totalRealizedLosses: number;
  totalDividends: number;
  totalInterest: number;
  washSaleAdjustments: number;
}

export interface TaxInput {
  filingStatus: FilingStatus;
  w2s: W2Entry[];
  income1099: {
    nec: Form1099NECEntry[];
    int: Form1099INTEntry[];
    div: Form1099DIVEntry[];
    b: Form1099BEntry[];
    misc: Form1099MISCEntry[];
    r: Form1099REntry[];
    s: Form1099SEntry[];
  };
  deductions: DeductionInputs;
  realEstateSales: RealEstateSaleEntry[];
  brokerage: BrokerageData;
  priorYear: PriorYearData;
}

// ---- Output Types ----

export interface BracketDetail {
  rate: number;
  rangeStart: number;
  rangeEnd: number;
  taxableInBracket: number;
  taxOnBracket: number;
}

export interface CapitalGainsDetail {
  rate: number;
  amount: number;
  tax: number;
}

export interface TaxResult {
  // Income
  grossIncome: number;
  wageIncome: number;
  selfEmploymentIncome: number;
  interestIncome: number;
  ordinaryDividends: number;
  qualifiedDividends: number;
  shortTermCapitalGains: number;
  longTermCapitalGains: number;
  realEstateGains: number;
  retirementIncome: number;
  otherIncome: number;

  // Adjustments
  halfSelfEmploymentTax: number;
  totalAdjustments: number;

  // AGI
  agi: number;

  // Deductions
  standardDeductionAmount: number;
  itemizedDeductionAmount: number;
  deductionUsed: 'standard' | 'itemized';
  deductionAmount: number;
  saltDeductionCapped: number;
  medicalDeductionAllowed: number;

  // Taxable Income
  taxableIncome: number;
  ordinaryTaxableIncome: number;
  preferentialIncome: number;

  // Taxes
  ordinaryIncomeTax: number;
  ordinaryTaxByBracket: BracketDetail[];
  capitalGainsTax: number;
  capitalGainsByRate: CapitalGainsDetail[];
  selfEmploymentTax: number;
  selfEmploymentTaxDetail: {
    socialSecurityTax: number;
    medicareTax: number;
  };
  additionalMedicareTax: number;
  niit: number;
  amtWarning: boolean;

  // Total Tax
  totalTaxBeforeCredits: number;

  // Credits & Payments
  totalFederalWithheld: number;
  totalEstimatedPayments: number;
  totalCreditsAndPayments: number;

  // Final
  totalTax: number;
  refundOrOwed: number;
  effectiveRate: number;
  marginalRate: number;

  // Carryforward
  capitalLossCarryforward: number;
}
