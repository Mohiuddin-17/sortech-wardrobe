import { useEffect, useState } from "react";
import api from "../api/axios";
import ClothingCard, { CATEGORY_LABELS } from "../components/ClothingCard";

export default function Outfits() {
  const [outfits, setOutfits] = useState([]);
  const [items, setItems] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [oRes, iRes] = await Promise.all([api.get("/outfits"), api.get("/clothing")]);
    setOutfits(oRes.data.outfits);
    setItems(iRes.data.items);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this outfit?")) return;
    await api.delete(`/outfits/${id}`);
    refresh();
  }

  async function handleShare(id) {
    const res = await api.post(`/outfits/${id}/share`);
    await navigator.clipboard.writeText(res.data.shareUrl).catch(() => null);
    alert(`Share link copied!\n${res.data.shareUrl}`);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-sortech-700">My Outfits</h2>
        <button className="btn-primary" onClick={() => setShowBuilder((v) => !v)}>
          {showBuilder ? "Close builder" : "+ Create outfit"}
        </button>
      </div>

      {showBuilder && (
        <OutfitBuilder
          items={items}
          onSaved={() => {
            setShowBuilder(false);
            refresh();
          }}
        />
      )}

      {loading ? (
        <p className="text-slate-400">Loading outfits...</p>
      ) : outfits.length === 0 ? (
        <p className="text-slate-400 text-center py-10">No outfits yet. Create one above!</p>
      ) : (
        <div className="space-y-6">
          {outfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onDelete={() => handleDelete(outfit.id)}
              onShare={() => handleShare(outfit.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OutfitCard({ outfit, onDelete, onShare }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sortech-700">{outfit.name}</h3>
        <div className="flex gap-2">
          <button onClick={onShare} className="btn-secondary py-1 px-3 text-xs">
            📤 Share
          </button>
          <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700">
            Delete
          </button>
        </div>
      </div>
      {/* Flat-lay grid — all outfit pieces displayed together */}
      <div className="flex gap-3 flex-wrap">
        {outfit.items.map((oi) => (
          <div key={oi.id} className="text-center">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-sortech-50 border border-sortech-100">
              <img
                src={oi.clothingItem.imageUrl}
                alt={oi.clothingItem.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 w-24 truncate">{oi.clothingItem.name}</p>
            <p className="text-xs text-sortech-500">{CATEGORY_LABELS[oi.clothingItem.category]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OutfitBuilder({ items, onSaved }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const [filterStyle, setFilterStyle] = useState("ALL");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function toggleItem(item) {
    setSelected((prev) =>
      prev.find((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [...prev, item]
    );
  }

  const filtered = items.filter((i) => filterStyle === "ALL" || i.style === filterStyle);

  async function handleSave() {
    if (!name.trim()) return setError("Give this outfit a name.");
    if (selected.length === 0) return setError("Pick at least one item.");
    setError("");
    setBusy(true);
    try {
      await api.post("/outfits", { name, itemIds: selected.map((i) => i.id) });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save outfit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-4">
      <h3 className="font-bold text-sortech-700">Build an outfit</h3>

      <input
        className="input"
        placeholder="Outfit name — e.g. Friday work look"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Preview of selected items as a flat-lay */}
      {selected.length > 0 && (
        <div className="bg-sortech-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
            Flat-lay preview ({selected.length} items)
          </p>
          <div className="flex gap-3 flex-wrap">
            {selected.map((item) => (
              <div key={item.id} className="text-center">
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-sortech-400">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-slate-500 mt-1 w-20 truncate">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {["ALL", "FORMAL", "INFORMAL"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStyle(s)}
            className={`px-3 py-1 rounded-lg text-xs font-medium ${
              filterStyle === s
                ? "bg-sortech-500 text-white"
                : "bg-white border border-sortech-200 text-slate-600"
            }`}
          >
            {s === "ALL" ? "All" : s === "FORMAL" ? "Formal" : "Casual"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-72 overflow-y-auto pr-1">
        {filtered.map((item) => (
          <ClothingCard
            key={item.id}
            item={item}
            selected={!!selected.find((i) => i.id === item.id)}
            onToggleSelect={toggleItem}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <button className="btn-primary" onClick={handleSave} disabled={busy}>
        {busy ? "Saving..." : "Save outfit"}
      </button>
    </div>
  );
}
