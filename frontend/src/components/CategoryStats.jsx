import { CATEGORY_LABELS } from "./ClothingCard";

export default function CategoryStats({ stats }) {
  if (!stats) return null;
  const entries = Object.entries(stats.byCategory || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-bold text-sortech-700">Your Wardrobe</h3>
        <span className="text-sm text-slate-500">
          {stats.totalItems} / {stats.limit} items
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {entries.length === 0 && (
          <p className="text-sm text-slate-400 col-span-3">No items yet — add your first one below.</p>
        )}
        {entries.map(([cat, count]) => (
          <div key={cat} className="bg-sortech-50 rounded-lg px-3 py-2 flex justify-between items-center">
            <span className="text-sm text-slate-600">{CATEGORY_LABELS[cat] || cat}</span>
            <span className="font-bold text-sortech-600">{count}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm border-t border-sortech-100 pt-3">
        <span className="text-slate-500">
          Formal: <b className="text-slate-700">{stats.byStyle?.FORMAL || 0}</b> · Casual:{" "}
          <b className="text-slate-700">{stats.byStyle?.INFORMAL || 0}</b>
        </span>
        {stats.itemsWithCost > 0 && (
          <span className="font-semibold text-sortech-700">
            Worth: {stats.totalWorth.toLocaleString()} {stats.currency}
          </span>
        )}
      </div>
    </div>
  );
}
