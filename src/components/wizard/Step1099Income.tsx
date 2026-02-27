import { useState } from 'react';
import { useTaxStore } from '../../store/useTaxStore';
import { generateId } from '../../utils/format';

const TABS = ['NEC', 'INT', 'DIV', 'B', 'MISC', 'R', 'S'] as const;
type TabType = typeof TABS[number];

export function Step1099Income() {
  const [activeTab, setActiveTab] = useState<TabType>('NEC');

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">1099 Income</h2>
        <p className="text-sm text-gray-500 mt-1">Enter income from 1099 forms by type</p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            1099-{tab}
          </button>
        ))}
      </div>

      {activeTab === 'NEC' && <NecSection />}
      {activeTab === 'INT' && <IntSection />}
      {activeTab === 'DIV' && <DivSection />}
      {activeTab === 'B' && <BSection />}
      {activeTab === 'MISC' && <MiscSection />}
      {activeTab === 'R' && <RSection />}
      {activeTab === 'S' && <SSection />}
    </div>
  );
}

function NecSection() {
  const { necs, addNec, updateNec, removeNec } = useTaxStore();
  return (
    <FormList
      title="1099-NEC (Freelance/Contract Income)"
      items={necs}
      onAdd={() => addNec({ id: generateId(), payerName: '', nonemployeeCompensation: 0 })}
      onRemove={removeNec}
      renderItem={(item) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payer Name</label>
            <input type="text" value={item.payerName} onChange={(e) => updateNec(item.id, { payerName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Company name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nonemployee Compensation</label>
            <input type="number" value={item.nonemployeeCompensation || ''} onChange={(e) => updateNec(item.id, { nonemployeeCompensation: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
        </div>
      )}
    />
  );
}

function IntSection() {
  const { ints, addInt, updateInt, removeInt } = useTaxStore();
  return (
    <FormList
      title="1099-INT (Interest Income)"
      items={ints}
      onAdd={() => addInt({ id: generateId(), payerName: '', interestIncome: 0 })}
      onRemove={removeInt}
      renderItem={(item) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payer Name</label>
            <input type="text" value={item.payerName} onChange={(e) => updateInt(item.id, { payerName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Bank name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Income</label>
            <input type="number" value={item.interestIncome || ''} onChange={(e) => updateInt(item.id, { interestIncome: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
        </div>
      )}
    />
  );
}

function DivSection() {
  const { divs, addDiv, updateDiv, removeDiv } = useTaxStore();
  return (
    <FormList
      title="1099-DIV (Dividend Income)"
      items={divs}
      onAdd={() => addDiv({ id: generateId(), payerName: '', ordinaryDividends: 0, qualifiedDividends: 0 })}
      onRemove={removeDiv}
      renderItem={(item) => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payer Name</label>
            <input type="text" value={item.payerName} onChange={(e) => updateDiv(item.id, { payerName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Broker name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordinary Dividends (1a)</label>
            <input type="number" value={item.ordinaryDividends || ''} onChange={(e) => updateDiv(item.id, { ordinaryDividends: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qualified Dividends (1b)</label>
            <input type="number" value={item.qualifiedDividends || ''} onChange={(e) => updateDiv(item.id, { qualifiedDividends: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
        </div>
      )}
    />
  );
}

function BSection() {
  const { bs, addB, updateB, removeB } = useTaxStore();
  return (
    <FormList
      title="1099-B (Stock/Investment Sales)"
      items={bs}
      onAdd={() => addB({ id: generateId(), description: '', proceeds: 0, costBasis: 0, gainLoss: 0, isLongTerm: true, washSaleDisallowed: 0 })}
      onRemove={removeB}
      renderItem={(item) => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={item.description} onChange={(e) => updateB(item.id, { description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="100 shares AAPL" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proceeds</label>
              <input type="number" value={item.proceeds || ''} onChange={(e) => updateB(item.id, { proceeds: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Basis</label>
              <input type="number" value={item.costBasis || ''} onChange={(e) => updateB(item.id, { costBasis: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gain/Loss</label>
              <input type="number" value={item.gainLoss || ''} onChange={(e) => updateB(item.id, { gainLoss: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wash Sale Disallowed</label>
              <input type="number" value={item.washSaleDisallowed || ''} onChange={(e) => updateB(item.id, { washSaleDisallowed: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={item.isLongTerm} onChange={() => updateB(item.id, { isLongTerm: true })} className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700">Long-term (held &gt; 1 year)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={!item.isLongTerm} onChange={() => updateB(item.id, { isLongTerm: false })} className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700">Short-term</span>
            </label>
          </div>
        </div>
      )}
    />
  );
}

function MiscSection() {
  const { miscs, addMisc, updateMisc, removeMisc } = useTaxStore();
  return (
    <FormList
      title="1099-MISC (Miscellaneous Income)"
      items={miscs}
      onAdd={() => addMisc({ id: generateId(), payerName: '', otherIncome: 0 })}
      onRemove={removeMisc}
      renderItem={(item) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payer Name</label>
            <input type="text" value={item.payerName} onChange={(e) => updateMisc(item.id, { payerName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Payer name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Income</label>
            <input type="number" value={item.otherIncome || ''} onChange={(e) => updateMisc(item.id, { otherIncome: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
        </div>
      )}
    />
  );
}

function RSection() {
  const { rs, addR, updateR, removeR } = useTaxStore();
  return (
    <FormList
      title="1099-R (Retirement Distributions)"
      items={rs}
      onAdd={() => addR({ id: generateId(), payerName: '', grossDistribution: 0, taxableAmount: 0, federalWithheld: 0 })}
      onRemove={removeR}
      renderItem={(item) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payer Name</label>
            <input type="text" value={item.payerName} onChange={(e) => updateR(item.id, { payerName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="401(k) provider" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gross Distribution</label>
            <input type="number" value={item.grossDistribution || ''} onChange={(e) => updateR(item.id, { grossDistribution: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taxable Amount</label>
            <input type="number" value={item.taxableAmount || ''} onChange={(e) => updateR(item.id, { taxableAmount: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Federal Tax Withheld</label>
            <input type="number" value={item.federalWithheld || ''} onChange={(e) => updateR(item.id, { federalWithheld: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
        </div>
      )}
    />
  );
}

function SSection() {
  const { ss, addS, updateS, removeS } = useTaxStore();
  return (
    <FormList
      title="1099-S (Real Estate Proceeds)"
      items={ss}
      onAdd={() => addS({ id: generateId(), propertyAddress: '', grossProceeds: 0 })}
      onRemove={removeS}
      renderItem={(item) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
            <input type="text" value={item.propertyAddress} onChange={(e) => updateS(item.id, { propertyAddress: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="123 Main St" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gross Proceeds</label>
            <input type="number" value={item.grossProceeds || ''} onChange={(e) => updateS(item.id, { grossProceeds: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
          </div>
        </div>
      )}
    />
  );
}

// Reusable list component
function FormList<T extends { id: string }>({ title, items, onAdd, onRemove, renderItem }: {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700 text-sm">{title}</h3>
      {items.length === 0 && (
        <div className="text-center py-6 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm mb-3">None added</p>
          <button onClick={onAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Add Entry
          </button>
        </div>
      )}
      {items.map((item, idx) => (
        <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">#{idx + 1}</span>
            <button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
          </div>
          {renderItem(item)}
        </div>
      ))}
      {items.length > 0 && (
        <button onClick={onAdd} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
          + Add Another
        </button>
      )}
    </div>
  );
}
