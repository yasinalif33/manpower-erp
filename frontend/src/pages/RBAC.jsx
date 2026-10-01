import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Shield,
  Users,
  UserPlus,
  Key,
  Lock,
  CheckCircle2,
  X,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
} from "lucide-react";

export default function RBAC() {
  const { user: currentUser } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Data Entry",
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      if (!res.ok) throw new Error("Failed to fetch");
      setUsers(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Account created successfully!");
      setFormData({ name: "", email: "", password: "", role: "Data Entry" });
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await fetch(`${API_URL}/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchUsers();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const changeRole = async (id, newRole) => {
    try {
      await fetch(`${API_URL}/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers();
    } catch (error) {
      alert("Failed to update role");
    }
  };

  const roleDefinitions = [
    {
      name: "Super Admin",
      desc: "Full access to all modules, financials, and user management.",
      color: "bg-slate-900 text-white",
    },
    {
      name: "Manager",
      desc: "Can manage candidates, flights, and quotas. Cannot view P&L or create users.",
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Accountant",
      desc: "Can issue money receipts and expense vouchers. Cannot edit candidates.",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      name: "Data Entry",
      desc: "Can only enroll new candidates. No access to financials or pipeline stages.",
      color: "bg-slate-100 text-slate-700",
    },
  ];

  if (currentUser?.role !== "Super Admin") {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Lock className="w-16 h-16 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">Access Restricted</h2>
        <p className="text-slate-500">
          Only Super Admins can manage roles and permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" /> Access Control (RBAC)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage staff accounts, system roles, and security permissions.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
        >
          <UserPlus className="w-4 h-4" /> Add Staff Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Security Matrix */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-slate-800">Role Permissions</h3>
            </div>
            <div className="p-4 space-y-3">
              {roleDefinitions.map((role) => (
                <div
                  key={role.name}
                  className="p-3 border border-slate-100 rounded-lg bg-slate-50"
                >
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${role.color}`}
                  >
                    {role.name}
                  </span>
                  <p className="text-xs text-slate-600 mt-2 font-medium">
                    {role.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-amber-800 text-xs font-semibold flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p>
              Deactivating an account immediately revokes their JWT token access
              on the next page refresh.
            </p>
          </div>
        </div>

        {/* Right Column: Staff Directory */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-slate-800">Staff Directory</h3>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[600px]">
              <thead className="bg-slate-50/50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Staff Member</th>
                  <th className="px-5 py-3">System Role</th>
                  <th className="px-5 py-3 text-center">Account Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-slate-400">
                      Loading accounts...
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3">
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          disabled={u.email === "admin@manpower.erp"}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          {roleDefinitions.map((r) => (
                            <option key={r.name} value={r.name}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => toggleStatus(u.id, u.isActive)}
                          disabled={u.email === "admin@manpower.erp"}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${u.isActive ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-rose-50 text-rose-700 hover:bg-rose-100"}`}
                        >
                          {u.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4" /> Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" /> Suspended
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Add Staff Account</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Temporary Password
                </label>
                <input
                  required
                  type="text"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Assign Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-bold"
                >
                  {roleDefinitions.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
