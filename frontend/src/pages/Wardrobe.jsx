import { useEffect, useState } from "react";
import api from "../api/axios";
import ClothingCard, { CATEGORY_LABELS } from "../components/ClothingCard";
import CategoryStats from "../components/CategoryStats";

const CATEGORIES = Object.keys(CATEGORY_LABELS);

export default function Wardrobe() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterStyle, setFilterStyle] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [itemsRes, statsRes] = await Promise.all([api.get("/clothing"), api.get("/clothing/stats")]);
    setItems(itemsRes.data.items);
    setStats(statsRes.data);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function handleDelete(item) {
    if (!confirm(`Remove "${item.name}"?`)) return;
    await api.delete(`/clothing/${item.id}`);
    refresh();
  }

  const filtered = items.filter((i) => {
    if (filterStyle !== "ALL" && i.style !== filterStyle) return false;
    if (filterCategory !== "ALL" && i.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-6 space-y-5">
      <CategoryStats stats={stats} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">My Clothes</h2>
        <button className="btn-primary flex items-center gap-1.5" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "✕ Close" : "+ Add item"}
        </button>
      </div>

      {showForm && <AddItemForm onAdded={() => { setShowForm(false); refresh(); }} />}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {["ALL", "FORMAL", "INFORMAL"].map((s) => (
          <button key={s} onClick={() => setFilterStyle(s)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filterStyle === s ? "bg-sortech-500 text-white" : "bg-white border border-gray-200 text-gray-500"
            }`}>
            {s === "ALL" ? "All styles" : s === "FORMAL" ? "Formal" : "Casual"}
          </button>
        ))}
        <div className="w-px bg-gray-200 shrink-0" />
        {["ALL", ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setFilterCategory(c)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filterCategory === c ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500"
            }`}>
            {c === "ALL" ? "All types" : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="card-flat overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-gray-100" />
              <div className="p-2.5 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">👕</p>
          <p className="font-semibold text-gray-500">No items found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different filter or add your first item</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((item) => (
            <ClothingCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function AddItemForm({ onAdded }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("TSHIRT");
  const [style, setStyle] = useState("INFORMAL");
  const [cost, setCost] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleFile(e) {
    const f = e.target.files[0];
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return setError("Please choose a photo.");
    setError("");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("category", category);
      form.append("style", style);
      if (cost) form.append("costAmount", cost);
      form.append("photo", file);
      await api.post("/clothing", form, { headers: { "Content-Type": "multipart/form-data" } });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || "Could not add item.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="font-bold text-gray-900">Add clothing item</h3>
      <div className="flex gap-4">
        <label className="shrink-0 w-24 h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer overflow-hidden hover:border-sortech-400 transition-colors bg-gray-50">
          {preview ? (
            <img src={preview} className="w-full h-full object-cover" alt="preview" />
          ) : (
            <>
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] text-gray-400 text-center">Tap to upload</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
        <div className="flex-1 space-y-3">
          <div>
            <label className="label">Item name</label>
            <input className="input" placeholder="e.g. Navy blue polo" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Category</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Style</label>
              <select className="input" value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="INFORMAL">Casual</option>
                <option value="FORMAL">Formal</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Cost (optional)</label>
            <input className="input" type="number" min="0" step="0.01" placeholder="e.g. 2500 PKR" value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Uploading..." : "Add to wardrobe"}
      </button>
    </form>
  );
}
