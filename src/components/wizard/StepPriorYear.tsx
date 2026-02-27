import { useTaxStore } from '../../store/useTaxStore';

export function StepPriorYear() {
  const { priorYear, setPriorYear } = useTaxStore();

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Prior Year Information</h2>
        <p className="text-sm text-gray-500 mt-1">Enter relevant data from your previous year's tax return</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prior Year AGI</label>
            <input type="number" value={priorYear.agi || ''} onChange={(e) => setPriorYear({ agi: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            <p className="text-xs text-gray-400 mt-1">From your 2024 Form 1040, Line 11</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Tax Payments Made</label>
            <input type="number" value={priorYear.estimatedPaymentsMade || ''} onChange={(e) => setPriorYear({ estimatedPaymentsMade: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            <p className="text-xs text-gray-400 mt-1">Total quarterly estimated payments for 2025</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capital Loss Carryforward</label>
            <input type="number" value={priorYear.capitalLossCarryforward || ''} onChange={(e) => setPriorYear({ capitalLossCarryforward: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            <p className="text-xs text-gray-400 mt-1">Unused capital losses from prior years</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prior Year Refund/Owed</label>
            <input type="number" value={priorYear.refundOrOwed || ''} onChange={(e) => setPriorYear({ refundOrOwed: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            <p className="text-xs text-gray-400 mt-1">Positive = refund received, Negative = amount paid</p>
          </div>
        </div>
      </div>
    </div>
  );
}
