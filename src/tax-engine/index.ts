import type { TaxInput, TaxResult, BracketDetail, CapitalGainsDetail, FilingStatus } from './types';
import {
  BRACKETS, STANDARD_DEDUCTION, LTCG_BRACKETS, SE_TAX,
  ADDITIONAL_MEDICARE, NIIT, SALT_CAP, SALT_CAP_MFS,
  CAPITAL_LOSS_LIMIT, CAPITAL_LOSS_LIMIT_MFS,
  PRIMARY_RESIDENCE_EXCLUSION, MEDICAL_EXPENSE_AGI_FLOOR,
} from './constants';

// ---- Helper ----
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// ---- Income Aggregation ----
function computeIncomeBreakdown(input: TaxInput) {
  const wageIncome = input.w2s.reduce((sum, w) => sum + w.wages, 0);
  const selfEmploymentIncome = input.income1099.nec.reduce((sum, n) => sum + n.nonemployeeCompensation, 0);
  const interestIncome =
    input.income1099.int.reduce((sum, i) => sum + i.interestIncome, 0) +
    input.brokerage.totalInterest;
  const ordinaryDividends =
    input.income1099.div.reduce((sum, d) => sum + d.ordinaryDividends, 0) +
    input.brokerage.totalDividends;
  const qualifiedDividends = input.income1099.div.reduce((sum, d) => sum + d.qualifiedDividends, 0);

  // 1099-B capital gains
  let shortTermGains = 0;
  let longTermGains = 0;
  for (const b of input.income1099.b) {
    const adjusted = b.gainLoss + b.washSaleDisallowed;
    if (b.isLongTerm) {
      longTermGains += adjusted;
    } else {
      shortTermGains += adjusted;
    }
  }
  // Brokerage summary (net, already accounts for gains and losses)
  shortTermGains += input.brokerage.totalRealizedGains;
  longTermGains -= input.brokerage.totalRealizedLosses;

  const retirementIncome = input.income1099.r.reduce((sum, r) => sum + r.taxableAmount, 0);
  const otherIncome = input.income1099.misc.reduce((sum, m) => sum + m.otherIncome, 0);

  // Real estate gains
  let realEstateGains = 0;
  for (const re of input.realEstateSales) {
    const gain = re.salePrice - re.purchasePrice - re.improvements + re.depreciation;
    if (re.isPrimaryResidence && re.meetsTwoOfFiveYearTest) {
      const exclusion = PRIMARY_RESIDENCE_EXCLUSION[input.filingStatus];
      const taxableGain = Math.max(0, gain - exclusion);
      realEstateGains += taxableGain;
    } else {
      realEstateGains += Math.max(0, gain);
    }
  }

  // Add 1099-S proceeds that aren't already captured in real estate sales
  const form1099SIncome = input.income1099.s.reduce((sum, s) => sum + s.grossProceeds, 0);
  // Only add if user hasn't provided detailed real estate sale entries
  if (input.realEstateSales.length === 0 && form1099SIncome > 0) {
    realEstateGains += form1099SIncome;
  }

  // Classify real estate gains: long-term if holding > 12 months
  for (const re of input.realEstateSales) {
    if (re.holdingPeriodMonths > 12) {
      // Already counted in realEstateGains, will be added to longTerm
    }
  }
  // For simplicity, add real estate gains to long-term capital gains
  longTermGains += realEstateGains;

  // Apply capital loss carryforward from prior year
  const carryforward = input.priorYear.capitalLossCarryforward;
  // Apply carryforward to short-term first, then long-term
  let remainingCarryforward = carryforward;
  if (shortTermGains < 0 || remainingCarryforward > 0) {
    // Carryforward reduces gains
  }
  shortTermGains -= Math.min(remainingCarryforward, Math.max(0, shortTermGains));
  remainingCarryforward = Math.max(0, remainingCarryforward - Math.max(0, shortTermGains + Math.min(remainingCarryforward, Math.max(0, shortTermGains))));

  // Net capital gains/losses
  const netShortTerm = shortTermGains;
  const netLongTerm = longTermGains;
  const netCapitalGainLoss = netShortTerm + netLongTerm;

  // Capital loss limitation
  const lossLimit = input.filingStatus === 'married_filing_separately'
    ? CAPITAL_LOSS_LIMIT_MFS : CAPITAL_LOSS_LIMIT;
  let capitalGainForIncome: number;
  let newCarryforward = 0;
  if (netCapitalGainLoss < 0) {
    capitalGainForIncome = Math.max(netCapitalGainLoss, -lossLimit);
    newCarryforward = Math.abs(netCapitalGainLoss) - lossLimit;
    if (newCarryforward < 0) newCarryforward = 0;
  } else {
    capitalGainForIncome = netCapitalGainLoss;
  }

  const grossIncome =
    wageIncome + selfEmploymentIncome + interestIncome + ordinaryDividends +
    capitalGainForIncome + retirementIncome + otherIncome;

  return {
    wageIncome,
    selfEmploymentIncome,
    interestIncome,
    ordinaryDividends,
    qualifiedDividends,
    shortTermCapitalGains: netShortTerm,
    longTermCapitalGains: Math.max(0, netLongTerm),
    realEstateGains,
    retirementIncome,
    otherIncome,
    grossIncome: Math.max(0, grossIncome),
    capitalLossCarryforward: newCarryforward,
    netCapitalGainLoss,
  };
}

// ---- Self-Employment Tax ----
function computeSelfEmploymentTax(sEIncome: number, w2SocialSecurityWages: number) {
  if (sEIncome <= 0) {
    return { socialSecurityTax: 0, medicareTax: 0, totalTax: 0, deductibleHalf: 0 };
  }
  const taxableBase = sEIncome * SE_TAX.netEarningsFactor;
  const remainingSSBase = Math.max(0, SE_TAX.socialSecurityWageBase - w2SocialSecurityWages);
  const ssTax = Math.min(taxableBase, remainingSSBase) * SE_TAX.socialSecurityRate;
  const medicareTax = taxableBase * SE_TAX.medicareRate;
  const totalTax = ssTax + medicareTax;
  return {
    socialSecurityTax: ssTax,
    medicareTax,
    totalTax,
    deductibleHalf: totalTax / 2,
  };
}

// ---- Deductions ----
function computeDeductions(
  input: TaxInput['deductions'],
  filingStatus: FilingStatus,
  agi: number
) {
  const standardAmount = STANDARD_DEDUCTION[filingStatus];

  // Itemized
  const saltCap = filingStatus === 'married_filing_separately' ? SALT_CAP_MFS : SALT_CAP;
  const saltDeduction = Math.min(input.stateLocalTaxesPaid, saltCap);

  const medicalFloor = agi * MEDICAL_EXPENSE_AGI_FLOOR;
  const medicalDeduction = Math.max(0, input.medicalExpenses - medicalFloor);

  const itemizedAmount = input.mortgageInterest + saltDeduction + input.charitableContributions + medicalDeduction;

  // User choice, but we show both
  const useItemized = input.type === 'itemized' && itemizedAmount > standardAmount;
  const deductionUsed = useItemized ? 'itemized' as const : 'standard' as const;
  const deductionAmount = useItemized ? itemizedAmount : standardAmount;

  return {
    standardDeductionAmount: standardAmount,
    itemizedDeductionAmount: itemizedAmount,
    deductionUsed,
    deductionAmount,
    saltDeductionCapped: saltDeduction,
    medicalDeductionAllowed: medicalDeduction,
  };
}

// ---- Ordinary Income Tax (progressive brackets) ----
function computeOrdinaryTax(taxableOrdinaryIncome: number, filingStatus: FilingStatus) {
  const brackets = BRACKETS[filingStatus];
  const details: BracketDetail[] = [];
  let totalTax = 0;
  let remaining = Math.max(0, taxableOrdinaryIncome);

  for (const bracket of brackets) {
    const bracketWidth = bracket.max - bracket.min;
    const taxableInBracket = Math.min(remaining, bracketWidth);
    if (taxableInBracket <= 0) {
      details.push({
        rate: bracket.rate,
        rangeStart: bracket.min,
        rangeEnd: bracket.max,
        taxableInBracket: 0,
        taxOnBracket: 0,
      });
      continue;
    }
    const taxOnBracket = taxableInBracket * bracket.rate;
    totalTax += taxOnBracket;
    remaining -= taxableInBracket;
    details.push({
      rate: bracket.rate,
      rangeStart: bracket.min,
      rangeEnd: bracket.max === Infinity ? bracket.min + taxableInBracket : bracket.max,
      taxableInBracket,
      taxOnBracket,
    });
  }

  // Marginal rate = rate of highest bracket with income
  let marginalRate = 0.10;
  for (const d of details) {
    if (d.taxableInBracket > 0) marginalRate = d.rate;
  }

  return { tax: totalTax, details, marginalRate };
}

// ---- Capital Gains Tax (stacking method) ----
function computeCapitalGainsTax(
  qualifiedDividends: number,
  longTermCapitalGains: number,
  ordinaryTaxableIncome: number,
  filingStatus: FilingStatus
) {
  const totalPreferential = qualifiedDividends + longTermCapitalGains;
  if (totalPreferential <= 0) {
    return { tax: 0, details: [] as CapitalGainsDetail[] };
  }

  const brackets = LTCG_BRACKETS[filingStatus];
  const details: CapitalGainsDetail[] = [];
  let totalTax = 0;
  // Stack: ordinary income fills first, then capital gains
  let filled = ordinaryTaxableIncome;
  let remaining = totalPreferential;

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const spaceInBracket = Math.max(0, bracket.max - filled);
    if (spaceInBracket <= 0) {
      filled = Math.max(filled, bracket.max);
      continue;
    }
    const taxableInBracket = Math.min(remaining, spaceInBracket);
    const taxOnBracket = taxableInBracket * bracket.rate;
    totalTax += taxOnBracket;
    remaining -= taxableInBracket;
    filled += taxableInBracket;
    if (taxableInBracket > 0) {
      details.push({ rate: bracket.rate, amount: taxableInBracket, tax: taxOnBracket });
    }
  }

  return { tax: totalTax, details };
}

// ---- Additional Medicare Tax ----
function computeAdditionalMedicare(
  totalEarnedIncome: number,
  filingStatus: FilingStatus
): number {
  const threshold = ADDITIONAL_MEDICARE.thresholds[filingStatus];
  return Math.max(0, totalEarnedIncome - threshold) * ADDITIONAL_MEDICARE.rate;
}

// ---- NIIT ----
function computeNIIT(
  agi: number,
  investmentIncome: number,
  filingStatus: FilingStatus
): number {
  const threshold = NIIT.thresholds[filingStatus];
  const excess = Math.max(0, agi - threshold);
  if (excess <= 0) return 0;
  return Math.min(excess, investmentIncome) * NIIT.rate;
}

// ---- Main Calculation ----
export function calculateTaxReturn(input: TaxInput): TaxResult {
  // 1. Income breakdown
  const income = computeIncomeBreakdown(input);

  // 2. Self-employment tax
  const w2SSWages = input.w2s.reduce((sum, w) => sum + w.socialSecurityWages, 0);
  const seTax = computeSelfEmploymentTax(income.selfEmploymentIncome, w2SSWages);

  // 3. Adjustments (above-the-line)
  const halfSETax = seTax.deductibleHalf;
  const totalAdjustments = halfSETax;

  // 4. AGI
  const agi = Math.max(0, income.grossIncome - totalAdjustments);

  // 5. Deductions
  const deductions = computeDeductions(input.deductions, input.filingStatus, agi);

  // 6. Taxable income
  const totalTaxableIncome = Math.max(0, agi - deductions.deductionAmount);

  // 7. Split ordinary vs preferential income
  const preferentialIncome = Math.max(0, income.qualifiedDividends + income.longTermCapitalGains);
  const ordinaryTaxableIncome = Math.max(0, totalTaxableIncome - preferentialIncome);

  // 8. Ordinary income tax
  const ordinaryResult = computeOrdinaryTax(ordinaryTaxableIncome, input.filingStatus);

  // 9. Capital gains tax
  const capGainsResult = computeCapitalGainsTax(
    income.qualifiedDividends,
    income.longTermCapitalGains,
    ordinaryTaxableIncome,
    input.filingStatus
  );

  // 10. Additional Medicare
  const totalEarned = income.wageIncome + income.selfEmploymentIncome * SE_TAX.netEarningsFactor;
  const additionalMedicare = computeAdditionalMedicare(totalEarned, input.filingStatus);

  // 11. NIIT
  const investmentIncome =
    income.interestIncome + income.ordinaryDividends +
    Math.max(0, income.shortTermCapitalGains) + income.longTermCapitalGains +
    income.realEstateGains;
  const niit = computeNIIT(agi, investmentIncome, input.filingStatus);

  // 12. AMT awareness (simplified)
  const amtWarning = agi > 200000 && deductions.deductionUsed === 'itemized';

  // 13. Total tax before credits
  const totalTaxBeforeCredits =
    ordinaryResult.tax + capGainsResult.tax + seTax.totalTax + additionalMedicare + niit;

  // 14. Credits and withholding
  const totalFederalWithheld =
    input.w2s.reduce((sum, w) => sum + w.federalWithheld, 0) +
    input.income1099.r.reduce((sum, r) => sum + r.federalWithheld, 0);
  const totalEstimatedPayments = input.priorYear.estimatedPaymentsMade;
  const totalCreditsAndPayments = totalFederalWithheld + totalEstimatedPayments;

  // 15. Final
  const totalTax = Math.max(0, totalTaxBeforeCredits);
  const refundOrOwed = totalCreditsAndPayments - totalTax;
  const effectiveRate = income.grossIncome > 0 ? totalTax / income.grossIncome : 0;

  return {
    grossIncome: income.grossIncome,
    wageIncome: income.wageIncome,
    selfEmploymentIncome: income.selfEmploymentIncome,
    interestIncome: income.interestIncome,
    ordinaryDividends: income.ordinaryDividends,
    qualifiedDividends: income.qualifiedDividends,
    shortTermCapitalGains: income.shortTermCapitalGains,
    longTermCapitalGains: income.longTermCapitalGains,
    realEstateGains: income.realEstateGains,
    retirementIncome: income.retirementIncome,
    otherIncome: income.otherIncome,

    halfSelfEmploymentTax: halfSETax,
    totalAdjustments,
    agi,

    standardDeductionAmount: deductions.standardDeductionAmount,
    itemizedDeductionAmount: deductions.itemizedDeductionAmount,
    deductionUsed: deductions.deductionUsed,
    deductionAmount: deductions.deductionAmount,
    saltDeductionCapped: deductions.saltDeductionCapped,
    medicalDeductionAllowed: deductions.medicalDeductionAllowed,

    taxableIncome: totalTaxableIncome,
    ordinaryTaxableIncome,
    preferentialIncome,

    ordinaryIncomeTax: ordinaryResult.tax,
    ordinaryTaxByBracket: ordinaryResult.details,
    capitalGainsTax: capGainsResult.tax,
    capitalGainsByRate: capGainsResult.details,
    selfEmploymentTax: seTax.totalTax,
    selfEmploymentTaxDetail: {
      socialSecurityTax: seTax.socialSecurityTax,
      medicareTax: seTax.medicareTax,
    },
    additionalMedicareTax: additionalMedicare,
    niit,
    amtWarning,

    totalTaxBeforeCredits,
    totalFederalWithheld,
    totalEstimatedPayments,
    totalCreditsAndPayments,

    totalTax,
    refundOrOwed,
    effectiveRate,
    marginalRate: ordinaryResult.marginalRate,

    capitalLossCarryforward: income.capitalLossCarryforward,
  };
}
