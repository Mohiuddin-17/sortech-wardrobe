import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import { useEffect, useState } from "react";
import api from "../api/axios";

// Icons as inline SVG — no icon library needed
const HomeIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const WardrobeIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);
const OutfitIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const InboxIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);
const AdminIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const is = (path) => location.pathname === path;

  useEffect(() => {
    if (!user) return;
    api.get("/outfits/inbox/unread").then((r) => setUnread(r.data.count)).catch(() => {});
    const interval = setInterval(() => {
      api.get("/outfits/inbox/unread").then((r) => setUnread(r.data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  return (
    <>
      {/* Top bar — desktop */}
      <nav className="hidden md:flex bg-white border-b border-gray-100 sticky top-0 z-20 h-14 items-center">
        <div className="max-w-4xl mx-auto w-full px-6 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-1">
            {[
              { to: "/", label: "Home", icon: <HomeIcon filled={is("/")} /> },
              { to: "/wardrobe", label: "Wardrobe", icon: <WardrobeIcon filled={is("/wardrobe")} /> },
              { to: "/outfits", label: "Outfits", icon: <OutfitIcon filled={is("/outfits")} /> },
              { to: "/inbox", label: "Inbox", icon: <InboxIcon filled={is("/inbox")} />, badge: unread },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === item.to
                    ? "text-sortech-600 bg-sortech-50"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.label}
                {item.badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            {user.role === "ADMIN" && (
              <Link to="/admin" className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${is("/admin") ? "text-sortech-600 bg-sortech-50" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
                <AdminIcon /> Admin
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sortech-100 flex items-center justify-center text-sortech-700 font-bold text-sm">
              {user.name[0].toUpperCase()}
            </div>
            <button onClick={logout} className="btn-ghost text-xs">Sign out</button>
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <nav className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-20 h-13 flex items-center px-4">
        <Logo />
        <div className="ml-auto flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-sortech-100 flex items-center justify-center text-sortech-700 font-bold text-sm">
            {user.name[0].toUpperCase()}
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20 flex safe-bottom">
        {[
          { to: "/", icon: <HomeIcon filled={is("/")} />, label: "Home" },
          { to: "/wardrobe", icon: <WardrobeIcon filled={is("/wardrobe")} />, label: "Wardrobe" },
          { to: "/outfits", icon: <OutfitIcon filled={is("/outfits")} />, label: "Outfits" },
          { to: "/inbox", icon: <InboxIcon filled={is("/inbox")} />, label: "Inbox", badge: unread },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`bottom-nav-item relative ${location.pathname === item.to ? "active" : ""}`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute top-1.5 right-5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
