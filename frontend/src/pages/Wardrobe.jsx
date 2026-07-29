import { useEffect, useState } from "react";
import api from "../api/axios";
import ClothingCard, { CATEGORY_LABELS } from "../components/ClothingCard";
import CategoryStats from "../components/CategoryStats";

const CATEGORIES = Object.keys(CATEGORY_LABELS);

export default function Wardrobe() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterStyle, setFilterStyle] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [itemsRes, statsRes] = await Promise.all([api.get("/clothing"), api.get("/clothing/stats")]);
    setItems(itemsRes.data.items);
    setStats(statsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(item) {
    if (!confirm(`Remove "${item.name}" from your wardrobe?`)) return;
    await api.delete(`/clothing/${item.id}`);
    refresh();
  }

  const filtered = items.filter((i) => filterStyle === "ALL" || i.style === filterStyle);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <CategoryStats stats={stats} />

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["ALL", "FORMAL", "INFORMAL"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStyle(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                filterStyle === s ? "bg-sortech-500 text-white" : "bg-white border border-sortech-200 text-slate-600"
              }`}
            >
              {s === "ALL" ? "All" : s === "FORMAL" ? "Formal" : "Casual"}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "+ Add clothing"}
        </button>
      </div>

      {showForm && (
        <AddItemForm
          onAdded={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      {loading ? (
        <p className="text-slate-400">Loading your wardrobe...</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-400 text-center py-10">No items in this filter yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
      setError(err.response?.data?.error || "Could not add this item.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h3 className="font-bold text-sortech-700">Add a clothing item</h3>

      <div className="flex gap-4 items-start">
        <label className="w-28 h-28 rounded-lg border-2 border-dashed border-sortech-200 flex items-center justify-center overflow-hidden cursor-pointer shrink-0 bg-sortech-50">
          {preview ? (
            <img src={preview} className="w-full h-full object-cover" alt="preview" />
          ) : (
            <span className="text-xs text-slate-400 text-center px-2">Tap to upload photo</span>
          )}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        </label>

        <div className="flex-1 space-y-2">
          <input
            className="input"
            placeholder="e.g. Navy blue polo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            <select className="input" value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="INFORMAL">Casual</option>
              <option value="FORMAL">Formal</option>
            </select>
          </div>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            placeholder="Cost (optional)"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <button className="btn-primary" disabled={busy}>
        {busy ? "Uploading..." : "Add to wardrobe"}
      </button>
    </form>
  );
}
