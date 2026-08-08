import { useEffect, useState } from "react";
import api from "../api/axios";
import { CATEGORY_LABELS } from "../components/ClothingCard";

export default function Inbox() {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/outfits/inbox")
      .then((r) => setShares(r.data.shares))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-6 space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Inbox</h2>
      <p className="text-sm text-gray-400">Outfits your friends have shared with you.</p>

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="flex gap-3">
                {Array(3).fill(0).map((_, j) => <div key={j} className="w-20 h-24 bg-gray-100 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : shares.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">💌</p>
          <p className="font-semibold text-gray-500">No outfits shared with you yet</p>
          <p className="text-sm text-gray-400 mt-1">When a friend shares an outfit, it shows up here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shares.map((share) => (
            <div key={share.id} className="card space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sortech-100 flex items-center justify-center text-sortech-700 font-bold text-sm shrink-0">
                  {share.fromUser.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{share.fromUser.name}</p>
                  <p className="text-xs text-gray-400">
                    shared <span className="font-medium text-gray-700">"{share.outfit.name}"</span>{" "}
                    · {new Date(share.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                  </p>
                </div>
                {!share.seenAt && (
                  <span className="ml-auto badge bg-sortech-500 text-white">New</span>
                )}
              </div>

              {share.message && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 italic">
                  "{share.message}"
                </p>
              )}

              <div className="flex gap-2.5 flex-wrap">
                {share.outfit.items.map((oi) => (
                  <div key={oi.id} className="text-center">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                      <img src={oi.clothingItem.imageUrl} alt={oi.clothingItem.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 w-20 truncate">
                      {CATEGORY_LABELS[oi.clothingItem.category]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
