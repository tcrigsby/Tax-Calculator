import { useTaxStore } from '../../store/useTaxStore';

export function StepBrokerage() {
  const { brokerage, setBrokerage } = useTaxStore();

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Brokerage Statements</h2>
        <p className="text-sm text-gray-500 mt-1">Enter summary totals from your brokerage account statements</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-sm text-gray-500">Enter aggregate totals that aren't already captured in your 1099-B, 1099-DIV, or 1099-INT entries above. Leave at zero if already entered.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Realized Gains</label>
            <input type="number" value={brokerage.totalRealizedGains || ''} onChange={(e) => setBrokerage({ totalRealizedGains: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Realized Losses</label>
            <input type="number" value={brokerage.totalRealizedLosses || ''} onChange={(e) => setBrokerage({ totalRealizedLosses: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Dividends</label>
            <input type="number" value={brokerage.totalDividends || ''} onChange={(e) => setBrokerage({ totalDividends: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Interest</label>
            <input type="number" value={brokerage.totalInterest || ''} onChange={(e) => setBrokerage({ totalInterest: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wash Sale Adjustments</label>
            <input type="number" value={brokerage.washSaleAdjustments || ''} onChange={(e) => setBrokerage({ washSaleAdjustments: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
        </div>
      </div>
    </div>
  );
}
