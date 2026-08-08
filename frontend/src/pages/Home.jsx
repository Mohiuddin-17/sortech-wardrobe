import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Home() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Good to see you, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1 text-sm">What are you wearing today?</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { to: "/wardrobe", emoji: "👕", title: "My Wardrobe", desc: "Browse & manage your clothes" },
            { to: "/outfits", emoji: "✨", title: "Outfits", desc: "Build & save outfit combinations" },
            { to: "/outfits?tab=history", emoji: "📅", title: "Wear History", desc: "See what you've worn & when" },
            { to: "/inbox", emoji: "💌", title: "Inbox", desc: "Outfits shared with you" },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="card hover:shadow-md transition-shadow group">
              <span className="text-3xl block mb-3">{item.emoji}</span>
              <p className="font-bold text-gray-900 group-hover:text-sortech-600 transition-colors">{item.title}</p>
              <p className="text-sm text-gray-400 mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <Logo size="lg" />
        <h1 className="text-4xl font-extrabold text-gray-900 mt-8 leading-tight">
          Your wardrobe,<br />organised.
        </h1>
        <p className="text-gray-400 mt-4 max-w-xs text-base leading-relaxed">
          Upload your clothes, build outfits, track what you wear, and share looks with friends.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-10 w-full max-w-xs">
          <Link to="/signup" className="btn-primary text-center w-full py-3 text-base">
            Get started free
          </Link>
          <Link to="/login" className="btn-secondary text-center w-full py-3 text-base">
            Sign in
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-4 w-full max-w-sm text-center">
          {[
            { emoji: "👕", label: "Upload clothes" },
            { emoji: "✨", label: "Build outfits" },
            { emoji: "📤", label: "Share looks" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-2">
              <span className="text-3xl">{f.emoji}</span>
              <span className="text-xs font-semibold text-gray-500">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
