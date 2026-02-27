import { useTaxStore } from '../../store/useTaxStore';
import { STANDARD_DEDUCTION } from '../../tax-engine/constants';
import { formatCurrency } from '../../utils/format';

export function StepDeductions() {
  const { deductions, setDeductions, filingStatus } = useTaxStore();
  const standardAmount = STANDARD_DEDUCTION[filingStatus];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Deductions</h2>
        <p className="text-sm text-gray-500 mt-1">Choose standard or itemized deductions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
          deductions.type === 'standard' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
        }`}>
          <div className="flex items-start gap-3">
            <input type="radio" checked={deductions.type === 'standard'} onChange={() => setDeductions({ type: 'standard' })} className="mt-1 h-4 w-4 text-blue-600" />
            <div>
              <span className="font-medium text-gray-900">Standard Deduction</span>
              <p className="text-sm text-gray-500 mt-0.5">{formatCurrency(standardAmount)}</p>
            </div>
          </div>
        </label>
        <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
          deductions.type === 'itemized' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
        }`}>
          <div className="flex items-start gap-3">
            <input type="radio" checked={deductions.type === 'itemized'} onChange={() => setDeductions({ type: 'itemized' })} className="mt-1 h-4 w-4 text-blue-600" />
            <div>
              <span className="font-medium text-gray-900">Itemized Deductions</span>
              <p className="text-sm text-gray-500 mt-0.5">Enter your specific deductions below</p>
            </div>
          </div>
        </label>
      </div>

      {deductions.type === 'itemized' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 mt-4">
          <h3 className="font-medium text-gray-900">Itemized Deduction Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Interest</label>
              <input type="number" value={deductions.mortgageInterest || ''} onChange={(e) => setDeductions({ mortgageInterest: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State & Local Taxes
                <span className="text-xs text-gray-400 ml-1">(SALT, capped at $10,000)</span>
              </label>
              <input type="number" value={deductions.stateLocalTaxesPaid || ''} onChange={(e) => setDeductions({ stateLocalTaxesPaid: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Charitable Contributions</label>
              <input type="number" value={deductions.charitableContributions || ''} onChange={(e) => setDeductions({ charitableContributions: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Expenses
                <span className="text-xs text-gray-400 ml-1">(above 7.5% of AGI)</span>
              </label>
              <input type="number" value={deductions.medicalExpenses || ''} onChange={(e) => setDeductions({ medicalExpenses: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            If your itemized deductions are less than the standard deduction ({formatCurrency(standardAmount)}), the standard deduction will be used automatically.
          </p>
        </div>
      )}
    </div>
  );
}
