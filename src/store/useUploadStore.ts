import { create } from 'zustand';
import type { ExtractionResult } from '../services/ai/types';

export type UploadPhase = 'guide' | 'upload' | 'processing' | 'review' | 'completeness';

export type FileStatus = 'queued' | 'processing' | 'done' | 'error';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: FileStatus;
  error?: string;
  result?: ExtractionResult;
}

export interface ChecklistItem {
  key: string;
  label: string;
  description: string;
  checked: boolean;
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  type: 'yesno' | 'value';
  answer?: 'yes' | 'no' | 'add_docs';
  value?: number;
  resolved: boolean;
}

interface UploadStore {
  phase: UploadPhase;
  setPhase: (phase: UploadPhase) => void;

  files: UploadedFile[];
  addFiles: (files: UploadedFile[]) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, update: Partial<UploadedFile>) => void;
  clearFiles: () => void;

  checklist: ChecklistItem[];
  setChecklist: (items: ChecklistItem[]) => void;
  toggleChecklistItem: (key: string) => void;

  // Tracks which extraction results the user approved
  approvedResults: Record<string, boolean>;
  setApproved: (fileId: string, approved: boolean) => void;

  followUpQuestions: FollowUpQuestion[];
  setFollowUpQuestions: (questions: FollowUpQuestion[]) => void;
  answerFollowUp: (id: string, answer: FollowUpQuestion['answer'], value?: number) => void;

  resetUpload: () => void;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { key: 'w2', label: 'W-2 Forms', description: 'From each employer you worked for', checked: false },
  { key: '1099-nec', label: '1099-NEC', description: 'Freelance/contract income', checked: false },
  { key: '1099-misc', label: '1099-MISC', description: 'Miscellaneous income (prizes, awards, etc.)', checked: false },
  { key: '1099-r', label: '1099-R', description: 'Retirement account distributions (401k, IRA, pension)', checked: false },
  { key: '1099-int', label: '1099-INT', description: 'Bank/savings interest income', checked: false },
  { key: '1099-div', label: '1099-DIV', description: 'Dividend income from investments', checked: false },
  { key: '1099-b', label: '1099-B / Brokerage Statement', description: 'Stock/investment sales', checked: false },
  { key: '1099-s', label: '1099-S', description: 'Real estate sale proceeds', checked: false },
  { key: 'mortgage', label: 'Form 1098 (Mortgage Statement)', description: 'Mortgage interest paid', checked: false },
  { key: 'property-tax', label: 'Property Tax Bills', description: 'Property taxes paid', checked: false },
  { key: 'charitable', label: 'Charitable Donation Receipts', description: 'Donations to qualified organizations', checked: false },
  { key: 'medical', label: 'Medical Expense Receipts', description: 'If significant medical expenses', checked: false },
  { key: 'prior-return', label: "Last Year's Tax Return (Form 1040)", description: 'For prior year AGI and carryforwards', checked: false },
  { key: 'estimated-payments', label: 'Estimated Tax Payments', description: 'Records of quarterly payments made', checked: false },
];

export const useUploadStore = create<UploadStore>()((set) => ({
  phase: 'guide',
  setPhase: (phase) => set({ phase }),

  files: [],
  addFiles: (files) => set((s) => ({ files: [...s.files, ...files] })),
  removeFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
  updateFile: (id, update) =>
    set((s) => ({
      files: s.files.map((f) => (f.id === id ? { ...f, ...update } : f)),
    })),
  clearFiles: () => set({ files: [] }),

  checklist: DEFAULT_CHECKLIST,
  setChecklist: (items) => set({ checklist: items }),
  toggleChecklistItem: (key) =>
    set((s) => ({
      checklist: s.checklist.map((item) =>
        item.key === key ? { ...item, checked: !item.checked } : item
      ),
    })),

  approvedResults: {},
  setApproved: (fileId, approved) =>
    set((s) => ({ approvedResults: { ...s.approvedResults, [fileId]: approved } })),

  followUpQuestions: [],
  setFollowUpQuestions: (questions) => set({ followUpQuestions: questions }),
  answerFollowUp: (id, answer, value) =>
    set((s) => ({
      followUpQuestions: s.followUpQuestions.map((q) =>
        q.id === id ? { ...q, answer, value, resolved: true } : q
      ),
    })),

  resetUpload: () =>
    set({
      phase: 'guide',
      files: [],
      checklist: DEFAULT_CHECKLIST,
      approvedResults: {},
      followUpQuestions: [],
    }),
}));
