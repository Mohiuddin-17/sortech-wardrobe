import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Logo from "../components/Logo";
import { CATEGORY_LABELS } from "../components/ClothingCard";

export default function SharedOutfit() {
  const { token } = useParams();
  const [outfit, setOutfit] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/shared/${token}`)
      .then((res) => setOutfit(res.data))
      .catch(() => setError("This share link is invalid or has expired."));
  }, [token]);

  return (
    <div className="min-h-screen bg-sortech-50 flex flex-col items-center py-12 px-4">
      <Logo size="lg" />

      {error && (
        <p className="mt-10 text-red-500 text-center">{error}</p>
      )}

      {outfit && (
        <div className="card mt-8 w-full max-w-lg">
          <p className="text-sm text-slate-500 mb-1">
            Outfit shared by <span className="font-semibold text-slate-700">{outfit.sharedBy}</span>
          </p>
          <h2 className="text-xl font-bold text-sortech-700 mb-4">{outfit.name}</h2>

          <div className="flex gap-4 flex-wrap">
            {outfit.items.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-sortech-50 border border-sortech-100 shadow-sm">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-medium text-slate-700 mt-1 w-28 truncate">{item.name}</p>
                <p className="text-xs text-sortech-500">{CATEGORY_LABELS[item.category] || item.category}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 mt-6 text-center">
            Powered by Sortech Wardrobe
          </p>
        </div>
      )}
    </div>
  );
}
