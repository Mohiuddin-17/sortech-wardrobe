const CATEGORY_LABELS = {
  TSHIRT: "T-Shirt",
  SHIRT: "Shirt",
  JEANS: "Jeans",
  TROUSER: "Trouser",
  PANTS: "Pants",
  SHOES: "Shoes",
  SANDALS: "Sandals",
  JACKET: "Jacket",
  KURTA: "Kurta",
  SHALWAR_KAMEEZ: "Shalwar Kameez",
  ACCESSORY: "Accessory",
  OTHER: "Other",
};

export default function ClothingCard({ item, selected, onToggleSelect, onDelete }) {
  return (
    <div
      className={`card cursor-pointer transition ${
        selected ? "ring-2 ring-sortech-500 border-sortech-500" : ""
      }`}
      onClick={() => onToggleSelect?.(item)}
    >
      <div className="aspect-square rounded-lg overflow-hidden bg-sortech-50 mb-2">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <p className="font-semibold text-sm truncate">{item.name}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs bg-sortech-100 text-sortech-700 rounded-full px-2 py-0.5">
          {CATEGORY_LABELS[item.category] || item.category}
        </span>
        <span
          className={`text-xs rounded-full px-2 py-0.5 ${
            item.style === "FORMAL" ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {item.style === "FORMAL" ? "Formal" : "Casual"}
        </span>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className="mt-2 text-xs text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      )}
    </div>
  );
}

export { CATEGORY_LABELS };
