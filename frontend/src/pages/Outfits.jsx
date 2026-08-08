import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { CATEGORY_LABELS } from "../components/ClothingCard";

// Segment groups — one item picked per group when building an outfit
const SEGMENTS = [
  { key: "TOP", label: "Top", categories: ["TSHIRT", "SHIRT", "KURTA", "SHALWAR_KAMEEZ", "JACKET"] },
  { key: "BOTTOM", label: "Bottom", categories: ["JEANS", "TROUSER", "PANTS"] },
  { key: "FOOTWEAR", label: "Footwear", categories: ["SHOES", "SANDALS"] },
  { key: "ACCESSORIES", label: "Accessories", categories: ["WATCH", "CAP", "ACCESSORY", "OTHER"] },
];

export default function Outfits() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "history" ? "history" : "outfits";
  const [tab, setTab] = useState(defaultTab);
  const [outfits, setOutfits] = useState([]);
  const [items, setItems] = useState([]);
  const [wearHistory, setWearHistory] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [oRes, iRes, hRes] = await Promise.all([
      api.get("/outfits"),
      api.get("/clothing"),
      api.get("/outfits/wear-history"),
    ]);
    setOutfits(oRes.data.outfits);
    setItems(iRes.data.items);
    setWearHistory(hRes.data.logs);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this outfit?")) return;
    await api.delete(`/outfits/${id}`);
    refresh();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Outfits</h2>
        <button className="btn-primary" onClick={() => setShowBuilder((v) => !v)}>
          {showBuilder ? "✕ Close" : "+ Build outfit"}
        </button>
      </div>

      {showBuilder && (
        <OutfitBuilder items={items} onSaved={() => { setShowBuilder(false); refresh(); }} />
      )}

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {[
          { key: "outfits", label: "My Outfits" },
          { key: "history", label: "Wear History" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key ? "bg-white shadow text-gray-900" : "text-gray-500"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "outfits" && (
        loading ? <LoadingSkeleton /> :
        outfits.length === 0 ? <EmptyState icon="✨" text="No outfits yet" sub="Build your first outfit above" /> :
        <div className="space-y-4">
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} onDelete={() => handleDelete(outfit.id)} onRefresh={refresh} />
          ))}
        </div>
      )}

      {tab === "history" && (
        loading ? <LoadingSkeleton /> :
        wearHistory.length === 0 ?
          <EmptyState icon="📅" text="No wear history yet" sub='Confirm an outfit to start tracking' /> :
        <div className="space-y-4">
          {wearHistory.map((log) => (
            <WearLogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Outfit Builder ────────────────────────────────────────────────────────────
function OutfitBuilder({ items, onSaved }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState({}); // { segmentKey: clothingItem }
  const [activeSegment, setActiveSegment] = useState("TOP");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function pickItem(segment, item) {
    setSelected((prev) => {
      if (prev[segment]?.id === item.id) {
        const next = { ...prev };
        delete next[segment];
        return next;
      }
      return { ...prev, [segment]: item };
    });
  }

  const selectedItems = Object.values(selected);

  async function handleSave() {
    if (selectedItems.length === 0) return setError("Pick at least one item.");
    setError("");
    setBusy(true);
    try {
      await api.post("/outfits", { name: name || "Untitled outfit", itemIds: selectedItems.map((i) => i.id) });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save outfit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-5">
      <div>
        <h3 className="font-bold text-gray-900 mb-1">Build an outfit</h3>
        <p className="text-xs text-gray-400">Select one item from each segment below</p>
      </div>

      {/* Flat-lay preview */}
      {selectedItems.length > 0 && (
        <div className="bg-gradient-to-br from-sortech-50 to-blue-50 rounded-2xl p-4">
          <p className="text-xs font-semibold text-sortech-600 uppercase tracking-wider mb-3">Outfit preview</p>
          <div className="flex gap-3 flex-wrap">
            {SEGMENTS.map((seg) =>
              selected[seg.key] ? (
                <div key={seg.key} className="text-center">
                  <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-white shadow-md">
                    <img src={selected[seg.key].imageUrl} alt={selected[seg.key].name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{seg.label}</p>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Segment tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {SEGMENTS.map((seg) => {
          const hasItem = !!selected[seg.key];
          return (
            <button key={seg.key} onClick={() => setActiveSegment(seg.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeSegment === seg.key
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200"
              }`}>
              {hasItem && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />}
              {seg.label}
            </button>
          );
        })}
      </div>

      {/* Items for active segment */}
      {SEGMENTS.map((seg) => {
        if (seg.key !== activeSegment) return null;
        const segItems = items.filter((i) => seg.categories.includes(i.category));
        return (
          <div key={seg.key}>
            {segItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No {seg.label.toLowerCase()} items in your wardrobe yet.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {segItems.map((item) => {
                  const isSelected = selected[seg.key]?.id === item.id;
                  return (
                    <div key={item.id} onClick={() => pickItem(seg.key, item)}
                      className={`card-flat overflow-hidden cursor-pointer transition-all ${
                        isSelected ? "ring-2 ring-sortech-500 shadow-md" : "hover:shadow-sm"
                      }`}>
                      <div className="aspect-square bg-gray-50 overflow-hidden relative">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-sortech-500/20 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-sortech-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-1.5">
                        <p className="text-[10px] font-semibold text-gray-800 truncate">{item.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div>
        <label className="label">Outfit name (optional)</label>
        <input className="input" placeholder="e.g. Friday work look" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <button className="btn-primary w-full" onClick={handleSave} disabled={busy || selectedItems.length === 0}>
        {busy ? "Saving..." : `Save outfit (${selectedItems.length} items)`}
      </button>
    </div>
  );
}

// ── Outfit card with share + confirm wearing ──────────────────────────────────
function OutfitCard({ outfit, onDelete, onRefresh }) {
  const [showShare, setShowShare] = useState(false);
  const [showWear, setShowWear] = useState(false);
  const lastWorn = outfit.wearLogs?.[0];

  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900">{outfit.name}</h3>
          {lastWorn && (
            <p className="text-xs text-gray-400 mt-0.5">
              Last worn: {new Date(lastWorn.wornAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
              {lastWorn.occasion && ` · ${lastWorn.occasion}`}
            </p>
          )}
        </div>
        <button onClick={onDelete} className="btn-danger">Delete</button>
      </div>

      {/* Flat-lay grid */}
      <div className="flex gap-2.5 flex-wrap">
        {outfit.items.map((oi) => (
          <div key={oi.id} className="text-center">
            <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
              <img src={oi.clothingItem.imageUrl} alt={oi.clothingItem.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 w-20 truncate">{CATEGORY_LABELS[oi.clothingItem.category]}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setShowWear((v) => !v)}
          className="btn-primary flex items-center gap-1.5 text-xs py-2">
          ✅ Confirm selection
        </button>
        <button onClick={() => setShowShare((v) => !v)}
          className="btn-secondary flex items-center gap-1.5 text-xs py-2">
          📤 Share with friend
        </button>
      </div>

      {showWear && (
        <ConfirmWearForm outfitId={outfit.id}
          onSaved={() => { setShowWear(false); onRefresh(); }} />
      )}
      {showShare && (
        <ShareForm outfitId={outfit.id} onDone={() => setShowShare(false)} />
      )}
    </div>
  );
}

// ── Confirm wearing ───────────────────────────────────────────────────────────
function ConfirmWearForm({ outfitId, onSaved }) {
  const [occasion, setOccasion] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const OCCASIONS = ["Office", "Casual outing", "Wedding", "Party", "Eid", "Date", "Gym", "Travel", "Other"];

  async function handleConfirm() {
    setBusy(true);
    try {
      await api.post(`/outfits/${outfitId}/wear`, { occasion: occasion || undefined, notes: notes || undefined });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-green-50 border border-green-100 rounded-2xl p-4 space-y-3">
      <p className="font-semibold text-green-800 text-sm">Confirm you're wearing this outfit today</p>
      <div>
        <label className="label">Occasion (optional)</label>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button key={o} onClick={() => setOccasion(occasion === o ? "" : o)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                occasion === o ? "bg-green-600 text-white border-green-600" : "bg-white border-gray-200 text-gray-600"
              }`}>
              {o}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Notes (optional)</label>
        <input className="input" placeholder="e.g. Felt great, got compliments" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button className="btn-primary text-sm" onClick={handleConfirm} disabled={busy}>
        {busy ? "Saving..." : "Confirm selection"}
      </button>
    </div>
  );
}

// ── Share with a friend ───────────────────────────────────────────────────────
function ShareForm({ outfitId, onDone }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // "success" | "error" | ""
  const [statusMsg, setStatusMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    if (!email) return;
    setBusy(true);
    setStatus("");
    try {
      await api.post(`/outfits/${outfitId}/share`, { toEmail: email, message: message || undefined });
      setStatus("success");
      setStatusMsg(`Outfit shared with ${email} and they've been notified by email.`);
    } catch (err) {
      setStatus("error");
      setStatusMsg(err.response?.data?.error || "Could not share outfit.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "success") {
    return (
      <div className="bg-sortech-50 border border-sortech-100 rounded-2xl p-4">
        <p className="text-sm font-semibold text-sortech-700">✓ {statusMsg}</p>
        <button className="text-xs text-sortech-500 mt-2 font-medium" onClick={onDone}>Close</button>
      </div>
    );
  }

  return (
    <div className="bg-sortech-50 border border-sortech-100 rounded-2xl p-4 space-y-3">
      <p className="font-semibold text-sortech-800 text-sm">Share with a friend</p>
      <div>
        <label className="label">Friend's email (must be registered)</label>
        <input className="input" type="email" placeholder="friend@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="label">Message (optional)</label>
        <input className="input" placeholder="e.g. What do you think of this?" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      {status === "error" && <p className="text-xs text-red-500">{statusMsg}</p>}
      <div className="flex gap-2">
        <button className="btn-primary text-sm" onClick={handleShare} disabled={busy || !email}>
          {busy ? "Sharing..." : "Share outfit"}
        </button>
        <button className="btn-ghost text-sm" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}

// ── Wear history card ─────────────────────────────────────────────────────────
function WearLogCard({ log }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-gray-900">{log.outfit.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(log.wornAt).toLocaleDateString("en-PK", {
              weekday: "short", day: "numeric", month: "long", year: "numeric",
            })}
            {log.occasion && ` · ${log.occasion}`}
          </p>
          {log.notes && <p className="text-xs text-gray-500 mt-1 italic">"{log.notes}"</p>}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {log.outfit.items.map((oi) => (
          <div key={oi.id} className="w-14 h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
            <img src={oi.clothingItem.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function EmptyState({ icon, text, sub }) {
  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-3">{icon}</p>
      <p className="font-semibold text-gray-500">{text}</p>
      <p className="text-sm text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="card animate-pulse space-y-3">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="flex gap-3">
            {Array(3).fill(0).map((_, j) => (
              <div key={j} className="w-20 h-24 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
