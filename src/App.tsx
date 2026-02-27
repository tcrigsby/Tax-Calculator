import { useState } from 'react';
import { useTaxStore } from './store/useTaxStore';
import { StepUploadDocuments } from './components/wizard/StepUploadDocuments';
import { StepFilingStatus } from './components/wizard/StepFilingStatus';
import { StepW2Income } from './components/wizard/StepW2Income';
import { Step1099Income } from './components/wizard/Step1099Income';
import { StepDeductions } from './components/wizard/StepDeductions';
import { StepRealEstate } from './components/wizard/StepRealEstate';
import { StepBrokerage } from './components/wizard/StepBrokerage';
import { StepPriorYear } from './components/wizard/StepPriorYear';
import { StepReview } from './components/wizard/StepReview';
import { StepResults } from './components/wizard/StepResults';

const STEPS = [
  { label: 'Upload Docs', component: StepUploadDocuments },
  { label: 'Filing Status', component: StepFilingStatus },
  { label: 'W-2 Income', component: StepW2Income },
  { label: '1099 Income', component: Step1099Income },
  { label: 'Deductions', component: StepDeductions },
  { label: 'Real Estate', component: StepRealEstate },
  { label: 'Brokerage', component: StepBrokerage },
  { label: 'Prior Year', component: StepPriorYear },
  { label: 'Review', component: StepReview },
  { label: 'Results', component: StepResults },
];

export default function App() {
  const { currentStep, setCurrentStep, resetAll } = useTaxStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const StepComponent = STEPS[currentStep].component;
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tax Calculator</h1>
            <p className="text-sm text-gray-500">2025 Federal Tax Estimator</p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Start Over
          </button>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STEPS.map((step, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                i === currentStep
                  ? 'bg-blue-600 text-white'
                  : i < currentStep
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
                i === currentStep ? 'border-white/30' : i < currentStep ? 'border-blue-300' : 'border-gray-300'
              }`}>
                {i < currentStep ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <main className="max-w-4xl mx-auto px-4 pb-32">
        <StepComponent />
      </main>

      {/* Navigation — hidden on Upload Docs step (has own nav) and Results */}
      {!isLast && !isFirst && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep <= 1}
              className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {currentStep === STEPS.length - 2 ? 'Calculate Taxes' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Over?</h3>
            <p className="text-gray-600 text-sm mb-4">
              This will clear all your entered data. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => { resetAll(); setShowResetConfirm(false); }}
                className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-medium text-sm"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer disclaimer - shown inline, not overlapping */}
      {!isLast && !isFirst && (
        <div className="max-w-4xl mx-auto px-4 pb-20">
          <p className="text-xs text-gray-400 text-center">
            For estimation purposes only — not professional tax advice.
          </p>
        </div>
      )}
    </div>
  );
}
