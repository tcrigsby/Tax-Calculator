export type DocumentType =
  | 'W-2'
  | '1099-NEC'
  | '1099-INT'
  | '1099-DIV'
  | '1099-B'
  | '1099-MISC'
  | '1099-R'
  | '1099-S'
  | 'prior_year_return'
  | 'brokerage_statement'
  | 'mortgage_statement'
  | 'property_tax_bill'
  | 'charitable_receipt'
  | 'medical_receipt'
  | 'unknown';

export interface W2ExtractedData {
  employerName: string;
  wages: number;
  federalWithheld: number;
  stateWithheld: number;
  socialSecurityWages: number;
  medicareWages: number;
}

export interface NecExtractedData {
  payerName: string;
  nonemployeeCompensation: number;
}

export interface IntExtractedData {
  payerName: string;
  interestIncome: number;
}

export interface DivExtractedData {
  payerName: string;
  ordinaryDividends: number;
  qualifiedDividends: number;
}

export interface BExtractedData {
  description: string;
  proceeds: number;
  costBasis: number;
  gainLoss: number;
  isLongTerm: boolean;
  washSaleDisallowed: number;
}

export interface MiscExtractedData {
  payerName: string;
  otherIncome: number;
}

export interface RExtractedData {
  payerName: string;
  grossDistribution: number;
  taxableAmount: number;
  federalWithheld: number;
}

export interface SExtractedData {
  propertyAddress: string;
  grossProceeds: number;
}

export interface PriorYearExtractedData {
  agi: number;
  refundOrOwed: number;
  estimatedPaymentsMade: number;
  capitalLossCarryforward: number;
}

export interface BrokerageExtractedData {
  totalRealizedGains: number;
  totalRealizedLosses: number;
  totalDividends: number;
  totalInterest: number;
  washSaleAdjustments: number;
}

export interface MortgageExtractedData {
  mortgageInterest: number;
}

export interface PropertyTaxExtractedData {
  propertyTaxPaid: number;
}

export interface CharitableExtractedData {
  organizationName: string;
  amount: number;
}

export interface MedicalExtractedData {
  providerName: string;
  amount: number;
}

export type ExtractedData =
  | W2ExtractedData
  | NecExtractedData
  | IntExtractedData
  | DivExtractedData
  | BExtractedData
  | MiscExtractedData
  | RExtractedData
  | SExtractedData
  | PriorYearExtractedData
  | BrokerageExtractedData
  | MortgageExtractedData
  | PropertyTaxExtractedData
  | CharitableExtractedData
  | MedicalExtractedData;

export interface ExtractionResult {
  documentType: DocumentType;
  confidence: number;
  extractedData: ExtractedData;
  notes: string;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: ClaudeContent[];
}

export type ClaudeContent =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } };

export interface ClaudeResponse {
  content: { type: string; text?: string }[];
  usage: { input_tokens: number; output_tokens: number };
}
