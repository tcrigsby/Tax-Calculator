export type SuggestionCategory =
  | 'self_employment'
  | 'retirement_savings'
  | 'above_the_line'
  | 'itemized_deduction'
  | 'tax_credit'
  | 'investment'
  | 'planning';

export type SuggestionConfidence = 'high' | 'medium' | 'low';

export const CATEGORY_LABELS: Record<SuggestionCategory, string> = {
  self_employment: 'Self-Employment',
  retirement_savings: 'Retirement Savings',
  above_the_line: 'Above-the-Line Deductions',
  itemized_deduction: 'Itemized Deductions',
  tax_credit: 'Tax Credits',
  investment: 'Investment Strategies',
  planning: 'Tax Planning',
};

export interface DeductionSuggestion {
  id: string;
  title: string;
  description: string;
  category: SuggestionCategory;
  estimatedDeductionAmount: number;
  estimatedTaxSavings: number;
  eligibilityReason: string;
  confidence: SuggestionConfidence;
  maxAllowable: number | null;
  mechanismType: 'above_the_line' | 'itemized' | 'credit' | 'exclusion';
}

export interface SuggestionResult {
  suggestions: DeductionSuggestion[];
  totalPotentialSavings: number;
  itemizedVsStandardGap: number;
}
