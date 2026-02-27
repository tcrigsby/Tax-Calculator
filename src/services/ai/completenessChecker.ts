import type { ExtractionResult } from './types';
import type { ChecklistItem, FollowUpQuestion } from '../../store/useUploadStore';
import { generateId } from '../../utils/format';

// Map checklist keys to document types
const CHECKLIST_TO_DOC_TYPE: Record<string, string[]> = {
  'w2': ['W-2'],
  '1099-nec': ['1099-NEC'],
  '1099-misc': ['1099-MISC'],
  '1099-r': ['1099-R'],
  '1099-int': ['1099-INT'],
  '1099-div': ['1099-DIV'],
  '1099-b': ['1099-B', 'brokerage_statement'],
  '1099-s': ['1099-S'],
  'mortgage': ['mortgage_statement'],
  'property-tax': ['property_tax_bill'],
  'charitable': ['charitable_receipt'],
  'medical': ['medical_receipt'],
  'prior-return': ['prior_year_return'],
  'estimated-payments': ['prior_year_return'],
};

interface GapItem {
  checklistKey: string;
  label: string;
}

export function findGaps(
  checklist: ChecklistItem[],
  results: ExtractionResult[],
): GapItem[] {
  const foundTypes = new Set(results.map((r) => r.documentType));
  const gaps: GapItem[] = [];

  for (const item of checklist) {
    if (!item.checked) continue;
    const docTypes = CHECKLIST_TO_DOC_TYPE[item.key] || [];
    const found = docTypes.some((dt) => foundTypes.has(dt as ExtractionResult['documentType']));
    if (!found) {
      gaps.push({ checklistKey: item.key, label: item.label });
    }
  }

  return gaps;
}

export function generateFollowUpQuestions(
  checklist: ChecklistItem[],
  results: ExtractionResult[],
): FollowUpQuestion[] {
  const foundTypes = new Set(results.map((r) => r.documentType));
  const checkedKeys = new Set(checklist.filter((c) => c.checked).map((c) => c.key));
  const questions: FollowUpQuestion[] = [];

  // Gap detection: user checked item but no matching document found
  const gaps = findGaps(checklist, results);
  for (const gap of gaps) {
    questions.push({
      id: generateId(),
      question: `You mentioned having ${gap.label}, but we didn't find a matching document. Did you forget to upload it?`,
      type: 'yesno',
      resolved: false,
    });
  }

  // Contextual follow-ups based on what was found
  if (foundTypes.has('1099-NEC') && !checkedKeys.has('estimated-payments')) {
    questions.push({
      id: generateId(),
      question: 'You have self-employment income. Did you make quarterly estimated tax payments this year?',
      type: 'value',
      resolved: false,
    });
  }

  if ((foundTypes.has('1099-DIV') || foundTypes.has('1099-INT')) &&
      !foundTypes.has('1099-B') && !foundTypes.has('brokerage_statement') &&
      !checkedKeys.has('1099-b')) {
    questions.push({
      id: generateId(),
      question: 'You have investment dividends/interest. Did you sell any stocks or investments this year?',
      type: 'yesno',
      resolved: false,
    });
  }

  if (!foundTypes.has('mortgage_statement') && !checkedKeys.has('mortgage')) {
    questions.push({
      id: generateId(),
      question: 'Do you own a home? (for mortgage interest deduction)',
      type: 'yesno',
      resolved: false,
    });
  }

  if (!foundTypes.has('charitable_receipt') && !checkedKeys.has('charitable')) {
    questions.push({
      id: generateId(),
      question: 'Did you make any charitable donations this year?',
      type: 'yesno',
      resolved: false,
    });
  }

  if (!foundTypes.has('1099-R') && !checkedKeys.has('1099-r')) {
    questions.push({
      id: generateId(),
      question: 'Did you receive any retirement distributions (401k, IRA, pension) this year?',
      type: 'yesno',
      resolved: false,
    });
  }

  if (!foundTypes.has('1099-S') && !checkedKeys.has('1099-s')) {
    questions.push({
      id: generateId(),
      question: 'Did you sell any real estate this year?',
      type: 'yesno',
      resolved: false,
    });
  }

  return questions;
}
