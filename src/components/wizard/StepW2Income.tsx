import { useTaxStore } from '../../store/useTaxStore';
import { generateId } from '../../utils/format';
import { formatCurrency } from '../../utils/format';

export function StepW2Income() {
  const { w2s, addW2, updateW2, removeW2 } = useTaxStore();

  const handleAdd = () => {
    addW2({
      id: generateId(),
      employerName: '',
      wages: 0,
      federalWithheld: 0,
      stateWithheld: 0,
      socialSecurityWages: 0,
      medicareWages: 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">W-2 Income</h2>
        <p className="text-sm text-gray-500 mt-1">Enter your W-2 wage information from each employer</p>
      </div>

      {w2s.length === 0 && (
        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-3">No W-2 forms added yet</p>
          <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Add W-2
          </button>
        </div>
      )}

      {w2s.map((w2, index) => (
        <div key={w2.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">W-2 #{index + 1}</h3>
            <button onClick={() => removeW2(w2.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name</label>
              <input
                type="text"
                value={w2.employerName}
                onChange={(e) => updateW2(w2.id, { employerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wages (Box 1)</label>
              <input
                type="number"
                value={w2.wages || ''}
                onChange={(e) => updateW2(w2.id, { wages: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Federal Tax Withheld (Box 2)</label>
              <input
                type="number"
                value={w2.federalWithheld || ''}
                onChange={(e) => updateW2(w2.id, { federalWithheld: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State Tax Withheld (Box 17)</label>
              <input
                type="number"
                value={w2.stateWithheld || ''}
                onChange={(e) => updateW2(w2.id, { stateWithheld: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Social Security Wages (Box 3)</label>
              <input
                type="number"
                value={w2.socialSecurityWages || ''}
                onChange={(e) => updateW2(w2.id, { socialSecurityWages: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medicare Wages (Box 5)</label>
              <input
                type="number"
                value={w2.medicareWages || ''}
                onChange={(e) => updateW2(w2.id, { medicareWages: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      ))}

      {w2s.length > 0 && (
        <div className="flex justify-between items-center">
          <button onClick={handleAdd} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            + Add Another W-2
          </button>
          <p className="text-sm text-gray-500">
            Total Wages: {formatCurrency(w2s.reduce((s, w) => s + w.wages, 0))}
          </p>
        </div>
      )}
    </div>
  );
}
