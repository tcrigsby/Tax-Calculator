import type { FilingStatus } from './types';

export const TAX_YEAR = 2025;

type BracketEntry = { rate: number; min: number; max: number };
type Brackets = Record<FilingStatus, BracketEntry[]>;

export const BRACKETS: Brackets = {
  single: [
    { rate: 0.10, min: 0, max: 11925 },
    { rate: 0.12, min: 11925, max: 48475 },
    { rate: 0.22, min: 48475, max: 103350 },
    { rate: 0.24, min: 103350, max: 197300 },
    { rate: 0.32, min: 197300, max: 250525 },
    { rate: 0.35, min: 250525, max: 626350 },
    { rate: 0.37, min: 626350, max: Infinity },
  ],
  married_filing_jointly: [
    { rate: 0.10, min: 0, max: 23850 },
    { rate: 0.12, min: 23850, max: 96950 },
    { rate: 0.22, min: 96950, max: 206700 },
    { rate: 0.24, min: 206700, max: 394600 },
    { rate: 0.32, min: 394600, max: 501050 },
    { rate: 0.35, min: 501050, max: 751600 },
    { rate: 0.37, min: 751600, max: Infinity },
  ],
  married_filing_separately: [
    { rate: 0.10, min: 0, max: 11925 },
    { rate: 0.12, min: 11925, max: 48475 },
    { rate: 0.22, min: 48475, max: 103350 },
    { rate: 0.24, min: 103350, max: 197300 },
    { rate: 0.32, min: 197300, max: 250525 },
    { rate: 0.35, min: 250525, max: 375800 },
    { rate: 0.37, min: 375800, max: Infinity },
  ],
  head_of_household: [
    { rate: 0.10, min: 0, max: 17000 },
    { rate: 0.12, min: 17000, max: 64850 },
    { rate: 0.22, min: 64850, max: 103350 },
    { rate: 0.24, min: 103350, max: 197300 },
    { rate: 0.32, min: 197300, max: 250500 },
    { rate: 0.35, min: 250500, max: 626350 },
    { rate: 0.37, min: 626350, max: Infinity },
  ],
  qualifying_surviving_spouse: [
    { rate: 0.10, min: 0, max: 23850 },
    { rate: 0.12, min: 23850, max: 96950 },
    { rate: 0.22, min: 96950, max: 206700 },
    { rate: 0.24, min: 206700, max: 394600 },
    { rate: 0.32, min: 394600, max: 501050 },
    { rate: 0.35, min: 501050, max: 751600 },
    { rate: 0.37, min: 751600, max: Infinity },
  ],
};

export const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 15000,
  married_filing_jointly: 30000,
  married_filing_separately: 15000,
  head_of_household: 22500,
  qualifying_surviving_spouse: 30000,
};

type LTCGBracketEntry = { rate: number; max: number };
export const LTCG_BRACKETS: Record<FilingStatus, LTCGBracketEntry[]> = {
  single: [
    { rate: 0.0, max: 48350 },
    { rate: 0.15, max: 533400 },
    { rate: 0.20, max: Infinity },
  ],
  married_filing_jointly: [
    { rate: 0.0, max: 96700 },
    { rate: 0.15, max: 600050 },
    { rate: 0.20, max: Infinity },
  ],
  married_filing_separately: [
    { rate: 0.0, max: 48350 },
    { rate: 0.15, max: 300025 },
    { rate: 0.20, max: Infinity },
  ],
  head_of_household: [
    { rate: 0.0, max: 64750 },
    { rate: 0.15, max: 566700 },
    { rate: 0.20, max: Infinity },
  ],
  qualifying_surviving_spouse: [
    { rate: 0.0, max: 96700 },
    { rate: 0.15, max: 600050 },
    { rate: 0.20, max: Infinity },
  ],
};

export const SE_TAX = {
  socialSecurityRate: 0.124,
  medicareRate: 0.029,
  socialSecurityWageBase: 176100,
  netEarningsFactor: 0.9235,
};

export const ADDITIONAL_MEDICARE = {
  rate: 0.009,
  thresholds: {
    single: 200000,
    married_filing_jointly: 250000,
    married_filing_separately: 125000,
    head_of_household: 200000,
    qualifying_surviving_spouse: 250000,
  } as Record<FilingStatus, number>,
};

export const NIIT = {
  rate: 0.038,
  thresholds: {
    single: 200000,
    married_filing_jointly: 250000,
    married_filing_separately: 125000,
    head_of_household: 200000,
    qualifying_surviving_spouse: 250000,
  } as Record<FilingStatus, number>,
};

export const SALT_CAP = 10000;
export const SALT_CAP_MFS = 5000;

export const CAPITAL_LOSS_LIMIT = 3000;
export const CAPITAL_LOSS_LIMIT_MFS = 1500;

export const PRIMARY_RESIDENCE_EXCLUSION: Record<FilingStatus, number> = {
  single: 250000,
  married_filing_jointly: 500000,
  married_filing_separately: 250000,
  head_of_household: 250000,
  qualifying_surviving_spouse: 500000,
};

export const MEDICAL_EXPENSE_AGI_FLOOR = 0.075;
