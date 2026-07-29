export default function Logo({ size = "md" }) {
  const sizes = { sm: "h-6 w-6 text-sm", md: "h-9 w-9 text-base", lg: "h-14 w-14 text-2xl" };
  const textSizes = { sm: "text-sm", md: "text-lg", lg: "text-3xl" };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizes[size]} rounded-lg bg-sortech-500 text-white font-extrabold flex items-center justify-center shadow-sm`}
      >
        S
      </div>
      <span className={`${textSizes[size]} font-extrabold text-sortech-700 tracking-tight`}>
        Sortech <span className="font-medium text-sortech-500">Wardrobe</span>
      </span>
    </div>
  );
}
