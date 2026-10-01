import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  X,
  MapPin,
  Phone,
  Briefcase,
  Wallet,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SubAgents({ setActiveTab }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    district: "",
  });

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/agents`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to register");

      alert("Sub-Agent registered successfully!");
      setFormData({ name: "", phone: "", district: "" });
      setIsDrawerOpen(false);
      fetchAgents(); // Refresh the list
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone.includes(searchTerm) ||
      (a.district &&
        a.district.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Sub-Agents Ledger
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage field brokers, referral tracking, and commission payouts.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">New Agent</span>
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">
            Loading agents...
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium bg-white rounded-xl border border-slate-200">
            No agents found. Click "New Agent" to register your first field
            broker.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg shrink-0">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />{" "}
                        {agent.district || "Unassigned"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 flex-1 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <Phone className="w-4 h-4 text-slate-400" /> {agent.phone}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                      <span className="text-[10px] uppercase font-bold text-indigo-500 flex items-center gap-1 mb-1">
                        <Briefcase className="w-3 h-3" /> Referrals
                      </span>
                      <p className="font-black text-indigo-900">
                        {agent._count.candidates} Pax
                      </p>
                    </div>
                    <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100/50">
                      <span className="text-[10px] uppercase font-bold text-rose-500 flex items-center gap-1 mb-1">
                        <Wallet className="w-3 h-3" /> Comm. Due
                      </span>
                      <p className="font-black text-rose-900">
                        ৳ {agent.dueAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <button className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    View Ledger
                  </button>
                  <button className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    Pay Commission
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Registration Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50">
          <div className="bg-white w-full sm:max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Register Sub-Agent</h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              <form
                id="agent-form"
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Agent Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g. Haji Kalam"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Mobile Number
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500/20"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    District / Area
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g. Comilla"
                  />
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50">
              <button
                type="submit"
                form="agent-form"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? "Registering..." : "Save Sub-Agent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
