import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-sortech-100 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link to="/wardrobe" className="text-slate-600 hover:text-sortech-600">
              Wardrobe
            </Link>
            <Link to="/outfits" className="text-slate-600 hover:text-sortech-600">
              Outfits
            </Link>
            {user.role === "ADMIN" && (
              <Link to="/admin" className="text-slate-600 hover:text-sortech-600">
                Admin
              </Link>
            )}
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">Hi, {user.name.split(" ")[0]}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="btn-secondary py-1.5 px-3"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
