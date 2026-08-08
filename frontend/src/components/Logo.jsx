// To swap the logo image: drop your PNG/SVG into frontend/public/logo.png
// and set VITE_LOGO_URL=/logo.png in frontend .env
// The text "Sortech Wardrobe" uses your brand colours as fallback.

export default function Logo({ size = "md", iconOnly = false }) {
  const logoUrl = import.meta.env.VITE_LOGO_URL;

  const iconSize = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-12 w-12" }[size];
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size];

  return (
    <div className="flex items-center gap-2.5">
      {logoUrl ? (
        <img src={logoUrl} alt="Sortech" className={`${iconSize} object-contain`} />
      ) : (
        <div
          className={`${iconSize} rounded-xl bg-sortech-500 text-white font-extrabold flex items-center justify-center shadow-sm shrink-0`}
        >
          <span className="text-lg leading-none">S</span>
        </div>
      )}
      {!iconOnly && (
        <span className={`${textSize} font-extrabold text-sortech-700 tracking-tight leading-none`}>
          Sortech{" "}
          <span className="font-medium text-sortech-400">Wardrobe</span>
        </span>
      )}
    </div>
  );
}
