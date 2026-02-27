import type { TaxInput, TaxResult } from './types';
import type { DeductionSuggestion, SuggestionResult } from './suggestionTypes';
import { SALT_CAP, MEDICAL_EXPENSE_AGI_FLOOR } from './constants';
import { formatCurrency } from '../utils/format';

// 2025 IRS limits for suggestions
const LIMITS = {
  IRA: 7000,
  K401: 23500,
  SEP_IRA: 69000,
  HSA_SINGLE: 4300,
  HSA_FAMILY: 8550,
  EDUCATOR: 300,
  STUDENT_LOAN: 2500,
  HOME_OFFICE: 1500,
  MILEAGE_RATE: 0.70,
  CHILD_TAX_CREDIT: 2000,
  FSA_HEALTHCARE: 3300,
  COMMUTER_MONTHLY: 325,
  SAVERS_CREDIT_SINGLE: 1000,
  SAVERS_CREDIT_JOINT: 2000,
  EITC_NO_KIDS: 632,
} as const;

export function generateSuggestions(
  input: TaxInput,
  result: TaxResult,
): SuggestionResult {
  const suggestions: DeductionSuggestion[] = [];
  const rate = result.marginalRate;

  suggestions.push(...selfEmploymentSuggestions(input, result, rate));
  suggestions.push(...retirementSuggestions(input, result, rate));
  suggestions.push(...aboveTheLineSuggestions(input, result, rate));
  suggestions.push(...itemizedSuggestions(input, result, rate));
  suggestions.push(...creditSuggestions(input, result));
  suggestions.push(...investmentSuggestions(result, rate));
  suggestions.push(...planningSuggestions(input, result, rate));

  // Sort by estimated savings descending, then by confidence
  suggestions.sort((a, b) => {
    if (b.estimatedTaxSavings !== a.estimatedTaxSavings)
      return b.estimatedTaxSavings - a.estimatedTaxSavings;
    const confOrder = { high: 3, medium: 2, low: 1 };
    return confOrder[b.confidence] - confOrder[a.confidence];
  });

  const totalPotentialSavings = suggestions.reduce(
    (sum, s) => sum + s.estimatedTaxSavings,
    0,
  );

  const itemizedVsStandardGap =
    result.itemizedDeductionAmount - result.standardDeductionAmount;

  return { suggestions, totalPotentialSavings, itemizedVsStandardGap };
}

// ── Self-Employment ──────────────────────────────────────────────

function selfEmploymentSuggestions(
  _input: TaxInput,
  result: TaxResult,
  rate: number,
): DeductionSuggestion[] {
  const suggestions: DeductionSuggestion[] = [];
  const seIncome = result.selfEmploymentIncome;
  if (seIncome <= 0) return suggestions;

  const hasW2 = result.wageIncome > 0;

  suggestions.push({
    id: 'home_office_deduction',
    title: 'Home Office Deduction',
    description:
      'If you use part of your home exclusively for business, you can deduct up to $1,500 using the simplified method ($5 per sq ft, up to 300 sq ft).',
    category: 'self_employment',
    estimatedDeductionAmount: LIMITS.HOME_OFFICE,
    estimatedTaxSavings: LIMITS.HOME_OFFICE * rate,
    eligibilityReason: 'You have self-employment income from 1099-NEC.',
    confidence: 'medium',
    maxAllowable: LIMITS.HOME_OFFICE,
    mechanismType: 'above_the_line',
  });

  const sepMax = Math.min(seIncome * 0.25, LIMITS.SEP_IRA);
  if (sepMax > 500) {
    suggestions.push({
      id: 'sep_ira_contribution',
      title: 'SEP-IRA Contribution',
      description: `Contribute up to 25% of net self-employment income (${formatCurrency(sepMax)}) to a SEP-IRA. This directly reduces your taxable income.`,
      category: 'retirement_savings',
      estimatedDeductionAmount: sepMax,
      estimatedTaxSavings: sepMax * rate,
      eligibilityReason: `You have ${formatCurrency(seIncome)} in self-employment income.`,
      confidence: 'high',
      maxAllowable: LIMITS.SEP_IRA,
      mechanismType: 'above_the_line',
    });
  }

  if (!hasW2) {
    const premiumEstimate = 7200;
    suggestions.push({
      id: 'se_health_insurance',
      title: 'Self-Employed Health Insurance Deduction',
      description:
        'Deduct health insurance premiums for yourself, your spouse, and dependents as an above-the-line deduction. Estimated at $600/month.',
      category: 'self_employment',
      estimatedDeductionAmount: premiumEstimate,
      estimatedTaxSavings: premiumEstimate * rate,
      eligibilityReason:
        'You appear to be fully self-employed without W-2 employer coverage.',
      confidence: 'medium',
      maxAllowable: null,
      mechanismType: 'above_the_line',
    });
  }

  const mileageEstimate = 5000 * LIMITS.MILEAGE_RATE;
  suggestions.push({
    id: 'vehicle_mileage',
    title: 'Business Vehicle Mileage',
    description: `Deduct $0.70/mile for business driving. This estimate assumes 5,000 business miles — track your actual mileage for a more accurate deduction.`,
    category: 'self_employment',
    estimatedDeductionAmount: mileageEstimate,
    estimatedTaxSavings: mileageEstimate * rate,
    eligibilityReason: 'You have self-employment income.',
    confidence: 'low',
    maxAllowable: null,
    mechanismType: 'above_the_line',
  });

  suggestions.push({
    id: 'se_business_expenses',
    title: 'Business Expenses',
    description:
      'Track and deduct ordinary and necessary business expenses: software, supplies, professional services, internet/phone (business portion), advertising, education, and travel.',
    category: 'self_employment',
    estimatedDeductionAmount: 0,
    estimatedTaxSavings: 0,
    eligibilityReason: 'You have self-employment income.',
    confidence: 'medium',
    maxAllowable: null,
    mechanismType: 'above_the_line',
  });

  return suggestions;
}

// ── Retirement Savings ──────────────────────────────────────────

function retirementSuggestions(
  input: TaxInput,
  result: TaxResult,
  rate: number,
): DeductionSuggestion[] {
  const suggestions: DeductionSuggestion[] = [];
  const hasEarnedIncome =
    result.wageIncome > 0 || result.selfEmploymentIncome > 0;
  if (!hasEarnedIncome) return suggestions;

  const isJoint =
    input.filingStatus === 'married_filing_jointly' ||
    input.filingStatus === 'qualifying_surviving_spouse';

  suggestions.push({
    id: 'traditional_ira',
    title: 'Traditional IRA Contribution',
    description:
      'Contribute up to $7,000 to a Traditional IRA to reduce taxable income. May be fully or partially deductible depending on employer plan and income.',
    category: 'retirement_savings',
    estimatedDeductionAmount: LIMITS.IRA,
    estimatedTaxSavings: LIMITS.IRA * rate,
    eligibilityReason: 'You have earned income.',
    confidence: 'medium',
    maxAllowable: LIMITS.IRA,
    mechanismType: 'above_the_line',
  });

  if (result.wageIncome > 0) {
    suggestions.push({
      id: '401k_contribution',
      title: '401(k) Contribution',
      description:
        'Maximize your 401(k) contributions up to $23,500. Pre-tax contributions reduce your taxable W-2 income. Check if your employer offers matching.',
      category: 'retirement_savings',
      estimatedDeductionAmount: LIMITS.K401,
      estimatedTaxSavings: LIMITS.K401 * rate,
      eligibilityReason:
        'You have W-2 income, suggesting potential employer plan access.',
      confidence: 'medium',
      maxAllowable: LIMITS.K401,
      mechanismType: 'above_the_line',
    });
  }

  const hsaMax = isJoint ? LIMITS.HSA_FAMILY : LIMITS.HSA_SINGLE;
  suggestions.push({
    id: 'hsa_contribution',
    title: 'HSA Contribution',
    description: `Health Savings Account contributions are tax-deductible if you have a high-deductible health plan. The 2025 limit is ${formatCurrency(hsaMax)}.`,
    category: 'retirement_savings',
    estimatedDeductionAmount: hsaMax,
    estimatedTaxSavings: hsaMax * rate,
    eligibilityReason: 'Requires a qualifying high-deductible health plan.',
    confidence: 'low',
    maxAllowable: hsaMax,
    mechanismType: 'above_the_line',
  });

  return suggestions;
}

// ── Above-the-Line ──────────────────────────────────────────────

function aboveTheLineSuggestions(
  input: TaxInput,
  result: TaxResult,
  rate: number,
): DeductionSuggestion[] {
  const suggestions: DeductionSuggestion[] = [];

  if (result.wageIncome > 0) {
    suggestions.push({
      id: 'educator_expenses',
      title: 'Educator Expense Deduction',
      description:
        'K-12 teachers can deduct up to $300 for unreimbursed classroom supplies.',
      category: 'above_the_line',
      estimatedDeductionAmount: LIMITS.EDUCATOR,
      estimatedTaxSavings: LIMITS.EDUCATOR * rate,
      eligibilityReason: 'Available to qualifying K-12 educators.',
      confidence: 'low',
      maxAllowable: LIMITS.EDUCATOR,
      mechanismType: 'above_the_line',
    });
  }

  const isJoint = input.filingStatus === 'married_filing_jointly';
  const slPhaseOutEnd = isJoint ? 195000 : 95000;
  if (result.agi < slPhaseOutEnd) {
    suggestions.push({
      id: 'student_loan_interest',
      title: 'Student Loan Interest Deduction',
      description:
        'Deduct up to $2,500 in student loan interest paid during the year.',
      category: 'above_the_line',
      estimatedDeductionAmount: LIMITS.STUDENT_LOAN,
      estimatedTaxSavings: LIMITS.STUDENT_LOAN * rate,
      eligibilityReason: 'Your AGI is within the income eligibility range.',
      confidence: 'medium',
      maxAllowable: LIMITS.STUDENT_LOAN,
      mechanismType: 'above_the_line',
    });
  }

  return suggestions;
}

// ── Itemized Deductions ─────────────────────────────────────────

function itemizedSuggestions(
  input: TaxInput,
  result: TaxResult,
  rate: number,
): DeductionSuggestion[] {
  const suggestions: DeductionSuggestion[] = [];

  const gap = result.standardDeductionAmount - result.itemizedDeductionAmount;

  // Charitable bunching if close
  if (result.deductionUsed === 'standard' && gap > 0 && gap < 10000) {
    suggestions.push({
      id: 'charitable_bunching',
      title: 'Charitable Contribution Bunching',
      description: `Your itemized deductions are ${formatCurrency(gap)} below the standard deduction. Consider "bunching" two years of charitable giving into one year to exceed the standard deduction, then take the standard in alternate years.`,
      category: 'itemized_deduction',
      estimatedDeductionAmount: gap,
      estimatedTaxSavings: gap * rate,
      eligibilityReason: `Itemized (${formatCurrency(result.itemizedDeductionAmount)}) is close to standard (${formatCurrency(result.standardDeductionAmount)}).`,
      confidence: 'medium',
      maxAllowable: null,
      mechanismType: 'itemized',
    });
  }

  // Donor-advised fund
  if (input.deductions.charitableContributions > 1000) {
    suggestions.push({
      id: 'donor_advised_fund',
      title: 'Donor-Advised Fund',
      description:
        'Make a larger lump-sum contribution to a donor-advised fund to maximize deductions this year while distributing grants to charities over time.',
      category: 'itemized_deduction',
      estimatedDeductionAmount: 0,
      estimatedTaxSavings: 0,
      eligibilityReason: `You already contribute ${formatCurrency(input.deductions.charitableContributions)} to charity.`,
      confidence: 'medium',
      maxAllowable: null,
      mechanismType: 'itemized',
    });
  }

  // SALT cap awareness
  if (input.deductions.stateLocalTaxesPaid > SALT_CAP) {
    const lost = input.deductions.stateLocalTaxesPaid - SALT_CAP;
    suggestions.push({
      id: 'salt_cap_awareness',
      title: 'SALT Cap Impact',
      description: `You paid ${formatCurrency(input.deductions.stateLocalTaxesPaid)} in state/local taxes but the deduction is capped at ${formatCurrency(SALT_CAP)}. You're losing ${formatCurrency(lost)} in potential deductions.`,
      category: 'itemized_deduction',
      estimatedDeductionAmount: 0,
      estimatedTaxSavings: 0,
      eligibilityReason: 'Your SALT exceeds the federal cap.',
      confidence: 'high',
      maxAllowable: SALT_CAP,
      mechanismType: 'itemized',
    });
  }

  // Medical threshold info
  const medicalFloor = result.agi * MEDICAL_EXPENSE_AGI_FLOOR;
  const currentMedical = input.deductions.medicalExpenses;

  if (currentMedical > 0 && currentMedical < medicalFloor) {
    const shortfall = medicalFloor - currentMedical;
    suggestions.push({
      id: 'medical_threshold',
      title: 'Medical Expense Threshold',
      description: `Your medical expenses (${formatCurrency(currentMedical)}) are ${formatCurrency(shortfall)} below the 7.5% AGI threshold (${formatCurrency(medicalFloor)}). Consider scheduling planned procedures before year-end to exceed this floor.`,
      category: 'itemized_deduction',
      estimatedDeductionAmount: 0,
      estimatedTaxSavings: 0,
      eligibilityReason:
        'Medical expenses don\'t yet exceed the AGI floor.',
      confidence: 'high',
      maxAllowable: null,
      mechanismType: 'itemized',
    });
  } else if (currentMedical === 0 && result.agi > 0) {
    suggestions.push({
      id: 'medical_expenses_prompt',
      title: 'Track Medical Expenses',
      description: `Medical expenses exceeding ${formatCurrency(medicalFloor)} (7.5% of your AGI) are deductible. Track all out-of-pocket costs: premiums, prescriptions, procedures, dental, and vision.`,
      category: 'itemized_deduction',
      estimatedDeductionAmount: 0,
      estimatedTaxSavings: 0,
      eligibilityReason: 'No medical expenses entered.',
      confidence: 'low',
      maxAllowable: null,
      mechanismType: 'itemized',
    });
  }

  return suggestions;
}

// ── Tax Credits ─────────────────────────────────────────────────

function creditSuggestions(
  input: TaxInput,
  result: TaxResult,
): DeductionSuggestion[] {
  const suggestions: DeductionSuggestion[] = [];
  const isJoint =
    input.filingStatus === 'married_filing_jointly' ||
    input.filingStatus === 'qualifying_surviving_spouse';

  // Child Tax Credit
  suggestions.push({
    id: 'child_tax_credit',
    title: 'Child Tax Credit',
    description:
      'If you have qualifying children under 17, you may be eligible for up to $2,000 per child. This calculator doesn\'t yet collect dependent information.',
    category: 'tax_credit',
    estimatedDeductionAmount: LIMITS.CHILD_TAX_CREDIT,
    estimatedTaxSavings: LIMITS.CHILD_TAX_CREDIT,
    eligibilityReason: 'Check if you have qualifying dependents.',
    confidence: 'low',
    maxAllowable: LIMITS.CHILD_TAX_CREDIT,
    mechanismType: 'credit',
  });

  // EITC
  const earnedIncome = result.wageIncome + result.selfEmploymentIncome;
  const eicThreshold = isJoint ? 25511 : 18591;
  if (earnedIncome > 0 && earnedIncome < eicThreshold) {
    suggestions.push({
      id: 'earned_income_credit',
      title: 'Earned Income Tax Credit (EITC)',
      description:
        'Based on your income level, you may qualify for the EITC. The credit increases significantly with qualifying children.',
      category: 'tax_credit',
      estimatedDeductionAmount: LIMITS.EITC_NO_KIDS,
      estimatedTaxSavings: LIMITS.EITC_NO_KIDS,
      eligibilityReason: `Your earned income of ${formatCurrency(earnedIncome)} is within EITC range.`,
      confidence: 'medium',
      maxAllowable: LIMITS.EITC_NO_KIDS,
      mechanismType: 'credit',
    });
  }

  // Saver's Credit
  const saversLimit = isJoint ? 79000 : 39500;
  if (result.agi < saversLimit && earnedIncome > 0) {
    const maxCredit = isJoint
      ? LIMITS.SAVERS_CREDIT_JOINT
      : LIMITS.SAVERS_CREDIT_SINGLE;
    suggestions.push({
      id: 'savers_credit',
      title: "Saver's Credit",
      description: `Low-to-moderate income earners can get a credit of up to ${formatCurrency(maxCredit)} for retirement plan contributions.`,
      category: 'tax_credit',
      estimatedDeductionAmount: maxCredit,
      estimatedTaxSavings: maxCredit,
      eligibilityReason: `Your AGI of ${formatCurrency(result.agi)} is below the Saver's Credit threshold.`,
      confidence: 'medium',
      maxAllowable: maxCredit,
      mechanismType: 'credit',
    });
  }

  return suggestions;
}

// ── Investment Strategies ───────────────────────────────────────

function investmentSuggestions(
  result: TaxResult,
  rate: number,
): DeductionSuggestion[] {
  const suggestions: DeductionSuggestion[] = [];

  const totalGains =
    Math.max(0, result.shortTermCapitalGains) + result.longTermCapitalGains;
  if (totalGains > 0) {
    const potentialOffset = totalGains * 0.5;
    suggestions.push({
      id: 'tax_loss_harvesting',
      title: 'Tax-Loss Harvesting',
      description: `You have ${formatCurrency(totalGains)} in capital gains. Selling losing positions before year-end could offset these gains and reduce your tax bill.`,
      category: 'investment',
      estimatedDeductionAmount: potentialOffset,
      estimatedTaxSavings: potentialOffset * rate,
      eligibilityReason: 'You have realized capital gains this year.',
      confidence: 'medium',
      maxAllowable: null,
      mechanismType: 'above_the_line',
    });
  }

  if (result.interestIncome > 1000) {
    suggestions.push({
      id: 'municipal_bonds',
      title: 'Consider Municipal Bonds',
      description:
        'Municipal bond interest is generally exempt from federal income tax. Consider shifting some interest-bearing investments to munis.',
      category: 'investment',
      estimatedDeductionAmount: result.interestIncome,
      estimatedTaxSavings: result.interestIncome * rate,
      eligibilityReason: `You have ${formatCurrency(result.interestIncome)} in taxable interest income.`,
      confidence: 'low',
      maxAllowable: null,
      mechanismType: 'exclusion',
    });
  }

  return suggestions;
}

// ── Tax Planning ────────────────────────────────────────────────

function planningSuggestions(
  input: TaxInput,
  result: TaxResult,
  rate: number,
): DeductionSuggestion[] {
  const suggestions: DeductionSuggestion[] = [];

  if (input.filingStatus === 'married_filing_jointly') {
    suggestions.push({
      id: 'filing_status_comparison',
      title: 'Compare Filing Separately',
      description:
        'In some cases (e.g., high medical expenses, income-driven student loan repayment), filing separately can save money. Try running the calculator with "Married Filing Separately" to compare.',
      category: 'planning',
      estimatedDeductionAmount: 0,
      estimatedTaxSavings: 0,
      eligibilityReason: 'You are filing jointly.',
      confidence: 'low',
      maxAllowable: null,
      mechanismType: 'above_the_line',
    });
  }

  if (rate <= 0.22 && result.retirementIncome > 0) {
    suggestions.push({
      id: 'roth_conversion',
      title: 'Roth Conversion Opportunity',
      description: `Your marginal rate is ${(rate * 100).toFixed(0)}%. This may be a good time to convert Traditional IRA funds to Roth, paying tax now at a lower rate to save in retirement.`,
      category: 'planning',
      estimatedDeductionAmount: 0,
      estimatedTaxSavings: 0,
      eligibilityReason: 'Your current marginal rate is relatively low.',
      confidence: 'low',
      maxAllowable: null,
      mechanismType: 'above_the_line',
    });
  }

  if (result.wageIncome > 0) {
    const fsaSavings = LIMITS.FSA_HEALTHCARE * rate;
    suggestions.push({
      id: 'employer_benefits',
      title: 'Maximize Employer Benefits',
      description: `Check for pre-tax benefits: FSA ($3,300 healthcare / $5,000 dependent care), commuter benefits ($325/mo), and 401(k) employer matching. These reduce taxable income.`,
      category: 'planning',
      estimatedDeductionAmount: LIMITS.FSA_HEALTHCARE,
      estimatedTaxSavings: fsaSavings,
      eligibilityReason: 'You have W-2 income with potential employer benefits.',
      confidence: 'low',
      maxAllowable: null,
      mechanismType: 'above_the_line',
    });
  }

  return suggestions;
}
