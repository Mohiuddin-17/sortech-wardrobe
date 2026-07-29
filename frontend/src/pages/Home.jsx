import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <Logo size="lg" />
      <h1 className="text-4xl font-extrabold text-sortech-700 mt-6 leading-tight">
        Your wardrobe, organised.
      </h1>
      <p className="text-slate-500 mt-3 max-w-md text-lg">
        Upload your clothes, build outfits, and stop wondering what to wear every morning.
      </p>
      <div className="flex gap-3 mt-8">
        {user ? (
          <Link to="/wardrobe" className="btn-primary text-base px-6 py-3">
            Open my wardrobe →
          </Link>
        ) : (
          <>
            <Link to="/signup" className="btn-primary text-base px-6 py-3">
              Get started — it's free
            </Link>
            <Link to="/login" className="btn-secondary text-base px-6 py-3">
              Sign in
            </Link>
          </>
        )}
      </div>

      <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl text-left">
        {[
          { icon: "👕", title: "Upload anything", desc: "T-shirts, jeans, shoes, shalwar kameez — all sorted into formal and casual." },
          { icon: "👗", title: "Build outfits", desc: "Pick items from your wardrobe and see them flat-laid together instantly." },
          { icon: "📤", title: "Share looks", desc: "Generate a public share link for any outfit and send it to a friend." },
        ].map((f) => (
          <div key={f.title} className="card">
            <p className="text-3xl mb-2">{f.icon}</p>
            <p className="font-bold text-sortech-700">{f.title}</p>
            <p className="text-sm text-slate-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
