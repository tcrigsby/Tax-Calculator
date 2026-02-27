import { useTaxStore } from '../../store/useTaxStore';
import { generateId } from '../../utils/format';

export function StepRealEstate() {
  const { realEstateSales, addRealEstate, updateRealEstate, removeRealEstate } = useTaxStore();

  const handleAdd = () => {
    addRealEstate({
      id: generateId(),
      propertyDescription: '',
      purchasePrice: 0,
      salePrice: 0,
      improvements: 0,
      depreciation: 0,
      holdingPeriodMonths: 0,
      isPrimaryResidence: false,
      meetsTwoOfFiveYearTest: false,
    });
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Real Estate Sales</h2>
        <p className="text-sm text-gray-500 mt-1">Enter details for any real estate properties you sold</p>
      </div>

      {realEstateSales.length === 0 && (
        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-3">No real estate sales to report</p>
          <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Add Property Sale
          </button>
        </div>
      )}

      {realEstateSales.map((re, index) => (
        <div key={re.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Property #{index + 1}</h3>
            <button onClick={() => removeRealEstate(re.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Description</label>
              <input type="text" value={re.propertyDescription} onChange={(e) => updateRealEstate(re.id, { propertyDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="123 Main St, Anytown, ST" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
              <input type="number" value={re.purchasePrice || ''} onChange={(e) => updateRealEstate(re.id, { purchasePrice: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
              <input type="number" value={re.salePrice || ''} onChange={(e) => updateRealEstate(re.id, { salePrice: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Improvements Cost</label>
              <input type="number" value={re.improvements || ''} onChange={(e) => updateRealEstate(re.id, { improvements: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation Claimed</label>
              <input type="number" value={re.depreciation || ''} onChange={(e) => updateRealEstate(re.id, { depreciation: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Holding Period (months)</label>
              <input type="number" value={re.holdingPeriodMonths || ''} onChange={(e) => updateRealEstate(re.id, { holdingPeriodMonths: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={re.isPrimaryResidence} onChange={(e) => updateRealEstate(re.id, { isPrimaryResidence: e.target.checked })} className="h-4 w-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">Primary Residence</span>
            </label>
            {re.isPrimaryResidence && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={re.meetsTwoOfFiveYearTest} onChange={(e) => updateRealEstate(re.id, { meetsTwoOfFiveYearTest: e.target.checked })} className="h-4 w-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-700">Meets 2-of-5 Year Test</span>
              </label>
            )}
          </div>
          {re.isPrimaryResidence && re.meetsTwoOfFiveYearTest && (
            <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              Eligible for primary residence exclusion ($250K single / $500K married filing jointly)
            </p>
          )}
        </div>
      ))}

      {realEstateSales.length > 0 && (
        <button onClick={handleAdd} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
          + Add Another Property
        </button>
      )}
    </div>
  );
}
