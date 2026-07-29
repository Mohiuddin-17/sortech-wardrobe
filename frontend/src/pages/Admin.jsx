import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Admin() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const [oRes, uRes] = await Promise.all([api.get("/admin/overview"), api.get("/admin/users")]);
      setOverview(oRes.data);
      setUsers(uRes.data.users);
    } catch {
      setError("Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function toggleRole(user) {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Set ${user.name} as ${newRole}?`)) return;
    try {
      await api.patch(`/admin/users/${user.id}/role`, { role: newRole });
      refresh();
    } catch (err) {
      alert(err.response?.data?.error || "Could not update role.");
    }
  }

  if (loading) return <p className="text-center py-20 text-slate-400">Loading...</p>;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-xl font-bold text-sortech-700">Admin Dashboard</h2>

      {/* Aggregate stats only — no user photos ever shown here */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: overview.userCount },
          { label: "Total Items Uploaded", value: overview.itemCount },
          { label: "Total Outfits", value: overview.outfitCount },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-3xl font-extrabold text-sortech-600">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <h3 className="font-bold text-sortech-700 mb-3">Users</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-sortech-100">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Role</th>
              <th className="pb-2 font-medium text-center">Items</th>
              <th className="pb-2 font-medium text-center">Outfits</th>
              <th className="pb-2 font-medium">Joined</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-sortech-50 hover:bg-sortech-50">
                <td className="py-2 font-medium">{u.name}</td>
                <td className="py-2 text-slate-500">{u.email}</td>
                <td className="py-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      u.role === "ADMIN"
                        ? "bg-sortech-100 text-sortech-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-2 text-center font-semibold text-sortech-600">{u.itemCount}</td>
                <td className="py-2 text-center font-semibold text-sortech-600">{u.outfitCount}</td>
                <td className="py-2 text-slate-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2">
                  <button
                    onClick={() => toggleRole(u)}
                    className="text-xs text-sortech-500 hover:text-sortech-700 font-medium"
                  >
                    {u.role === "ADMIN" ? "Demote" : "Make admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Admin view shows item/outfit counts only. User photos and wardrobe contents are private.
      </p>
    </div>
  );
}
