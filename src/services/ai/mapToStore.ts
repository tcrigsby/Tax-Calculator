import type { ExtractionResult } from './types';
import type {
  W2ExtractedData, NecExtractedData, IntExtractedData, DivExtractedData,
  BExtractedData, MiscExtractedData, RExtractedData, SExtractedData,
  PriorYearExtractedData, BrokerageExtractedData, MortgageExtractedData,
  PropertyTaxExtractedData, CharitableExtractedData, MedicalExtractedData,
} from './types';
import { useTaxStore } from '../../store/useTaxStore';
import { generateId } from '../../utils/format';

export function applyExtractionToStore(results: ExtractionResult[]): void {
  const store = useTaxStore.getState();

  // Accumulate deduction-related values
  let totalMortgageInterest = store.deductions.mortgageInterest;
  let totalPropertyTax = store.deductions.stateLocalTaxesPaid;
  let totalCharitable = store.deductions.charitableContributions;
  let totalMedical = store.deductions.medicalExpenses;
  let hasItemizedData = false;

  for (const result of results) {
    const d = result.extractedData;

    switch (result.documentType) {
      case 'W-2': {
        const w2 = d as W2ExtractedData;
        store.addW2({
          id: generateId(),
          employerName: w2.employerName || 'Unknown Employer',
          wages: w2.wages || 0,
          federalWithheld: w2.federalWithheld || 0,
          stateWithheld: w2.stateWithheld || 0,
          socialSecurityWages: w2.socialSecurityWages || 0,
          medicareWages: w2.medicareWages || 0,
        });
        break;
      }
      case '1099-NEC': {
        const nec = d as NecExtractedData;
        store.addNec({
          id: generateId(),
          payerName: nec.payerName || 'Unknown Payer',
          nonemployeeCompensation: nec.nonemployeeCompensation || 0,
        });
        break;
      }
      case '1099-INT': {
        const int = d as IntExtractedData;
        store.addInt({
          id: generateId(),
          payerName: int.payerName || 'Unknown Payer',
          interestIncome: int.interestIncome || 0,
        });
        break;
      }
      case '1099-DIV': {
        const div = d as DivExtractedData;
        store.addDiv({
          id: generateId(),
          payerName: div.payerName || 'Unknown Payer',
          ordinaryDividends: div.ordinaryDividends || 0,
          qualifiedDividends: div.qualifiedDividends || 0,
        });
        break;
      }
      case '1099-B': {
        const b = d as BExtractedData;
        store.addB({
          id: generateId(),
          description: b.description || 'Investment Sale',
          proceeds: b.proceeds || 0,
          costBasis: b.costBasis || 0,
          gainLoss: b.gainLoss || 0,
          isLongTerm: b.isLongTerm ?? true,
          washSaleDisallowed: b.washSaleDisallowed || 0,
        });
        break;
      }
      case '1099-MISC': {
        const misc = d as MiscExtractedData;
        store.addMisc({
          id: generateId(),
          payerName: misc.payerName || 'Unknown Payer',
          otherIncome: misc.otherIncome || 0,
        });
        break;
      }
      case '1099-R': {
        const r = d as RExtractedData;
        store.addR({
          id: generateId(),
          payerName: r.payerName || 'Unknown Payer',
          grossDistribution: r.grossDistribution || 0,
          taxableAmount: r.taxableAmount || 0,
          federalWithheld: r.federalWithheld || 0,
        });
        break;
      }
      case '1099-S': {
        const s = d as SExtractedData;
        store.addS({
          id: generateId(),
          propertyAddress: s.propertyAddress || 'Unknown Property',
          grossProceeds: s.grossProceeds || 0,
        });
        break;
      }
      case 'prior_year_return': {
        const py = d as PriorYearExtractedData;
        store.setPriorYear({
          agi: py.agi || 0,
          refundOrOwed: py.refundOrOwed || 0,
          estimatedPaymentsMade: py.estimatedPaymentsMade || 0,
          capitalLossCarryforward: py.capitalLossCarryforward || 0,
        });
        break;
      }
      case 'brokerage_statement': {
        const bk = d as BrokerageExtractedData;
        store.setBrokerage({
          totalRealizedGains: bk.totalRealizedGains || 0,
          totalRealizedLosses: bk.totalRealizedLosses || 0,
          totalDividends: bk.totalDividends || 0,
          totalInterest: bk.totalInterest || 0,
          washSaleAdjustments: bk.washSaleAdjustments || 0,
        });
        break;
      }
      case 'mortgage_statement': {
        const m = d as MortgageExtractedData;
        totalMortgageInterest += m.mortgageInterest || 0;
        hasItemizedData = true;
        break;
      }
      case 'property_tax_bill': {
        const pt = d as PropertyTaxExtractedData;
        totalPropertyTax += pt.propertyTaxPaid || 0;
        hasItemizedData = true;
        break;
      }
      case 'charitable_receipt': {
        const ch = d as CharitableExtractedData;
        totalCharitable += ch.amount || 0;
        hasItemizedData = true;
        break;
      }
      case 'medical_receipt': {
        const med = d as MedicalExtractedData;
        totalMedical += med.amount || 0;
        hasItemizedData = true;
        break;
      }
    }
  }

  // Apply accumulated deduction data
  if (hasItemizedData) {
    store.setDeductions({
      type: 'itemized',
      mortgageInterest: totalMortgageInterest,
      stateLocalTaxesPaid: totalPropertyTax,
      charitableContributions: totalCharitable,
      medicalExpenses: totalMedical,
    });
  }
}
