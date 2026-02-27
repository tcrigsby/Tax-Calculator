import { useUploadStore } from '../../store/useUploadStore';
import { useTaxStore } from '../../store/useTaxStore';

export function DocumentGuide() {
  const { checklist, toggleChecklistItem, setPhase } = useUploadStore();
  const setCurrentStep = useTaxStore((s) => s.setCurrentStep);

  const incomeItems = checklist.filter((c) =>
    ['w2', '1099-nec', '1099-misc', '1099-r'].includes(c.key)
  );
  const investmentItems = checklist.filter((c) =>
    ['1099-int', '1099-div', '1099-b', '1099-s'].includes(c.key)
  );
  const deductionItems = checklist.filter((c) =>
    ['mortgage', 'property-tax', 'charitable', 'medical'].includes(c.key)
  );
  const otherItems = checklist.filter((c) =>
    ['prior-return', 'estimated-payments'].includes(c.key)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Before we start, let's gather your documents
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Check off the documents you have available. This helps us make sure nothing gets missed.
          You can upload PDFs, photos, or scans of any of these.
        </p>

        <ChecklistSection title="Income Documents" items={incomeItems} onToggle={toggleChecklistItem} />
        <ChecklistSection title="Investment Documents" items={investmentItems} onToggle={toggleChecklistItem} />
        <ChecklistSection title="Deduction Documents" items={deductionItems} onToggle={toggleChecklistItem} />
        <ChecklistSection title="Other" items={otherItems} onToggle={toggleChecklistItem} />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Skip — I'll enter data manually
        </button>
        <button
          onClick={() => setPhase('upload')}
          className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          I have my documents ready
        </button>
      </div>
    </div>
  );
}

function ChecklistSection({
  title,
  items,
  onToggle,
}: {
  title: string;
  items: { key: string; label: string; description: string; checked: boolean }[];
  onToggle: (key: string) => void;
}) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.key}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => onToggle(item.key)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">{item.label}</span>
              <span className="text-xs text-gray-500 block">{item.description}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
