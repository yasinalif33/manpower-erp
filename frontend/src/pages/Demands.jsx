import { useState, useEffect } from "react";
import {
  Briefcase,
  Search,
  Plus,
  X,
  Building2,
  Users,
  PieChart,
  MapPin,
} from "lucide-react";

export default function Demands() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    demandNo: "",
    companyName: "",
    country: "Saudi Arabia",
    trade: "",
    quota: "",
  });

  const fetchDemands = async () => {
    try {
      const response = await fetch(`${API_URL}/api/demands`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setDemands(data);
    } catch (error) {
      console.error("Error fetching demands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const handleCreateDemand = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/demands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to create demand");

      alert("Demand registered successfully!");
      setFormData({
        demandNo: "",
        companyName: "",
        country: "Saudi Arabia",
        trade: "",
        quota: "",
      });
      setIsModalOpen(false);
      fetchDemands();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDemands = demands.filter(
    (d) =>
      d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.demandNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.trade.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Top level calculations
  const totalQuota = demands.reduce((sum, d) => sum + d.quota, 0);
  const totalFilled = demands.reduce((sum, d) => sum + d._count.candidates, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 h-full flex flex-col">
      {/* Header & Metrics */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" /> Foreign Demands &
            Quota
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track overseas company demand letters and available visa slots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-6 px-6 py-2 bg-slate-50 rounded-lg border border-slate-200/60">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">
                Total Quota
              </p>
              <p className="text-lg font-black text-slate-800">{totalQuota}</p>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-600">
                Slots Filled
              </p>
              <p className="text-lg font-black text-blue-700">{totalFilled}</p>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-600">
                Available
              </p>
              <p className="text-lg font-black text-emerald-700">
                {totalQuota - totalFilled}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all shrink-0 ml-auto"
          >
            <Plus className="w-4 h-4" /> Add Demand
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-md shrink-0">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search company, trade, or demand no..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Demands Grid */}
      <div className="flex-1 overflow-y-auto pb-8">
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">
            Loading demand quotas...
          </div>
        ) : filteredDemands.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium bg-white rounded-xl border border-slate-200">
            No demands found. Add your first demand letter to start tracking
            slots.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredDemands.map((demand) => {
              const filled = demand._count.candidates;
              const remaining = demand.quota - filled;
              const percent = Math.min(100, (filled / demand.quota) * 100);
              const isFull = remaining <= 0;

              return (
                <div
                  key={demand.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {isFull && (
                    <div className="absolute top-3 right-3 bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md">
                      Quota Full
                    </div>
                  )}
                  <div className="mb-4 pr-16">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">
                      {demand.companyName}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />{" "}
                        {demand.country}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        <FileText className="w-3.5 h-3.5" /> {demand.demandNo}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-3 mb-4">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-slate-600">{demand.trade}</span>
                      <span className="text-slate-900">
                        Total: {demand.quota}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-1.5">
                        <span
                          className={
                            isFull ? "text-rose-600" : "text-emerald-600"
                          }
                        >
                          {filled} Filled
                        </span>
                        <span className="text-slate-500">
                          {remaining} Available
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${isFull ? "bg-rose-500" : "bg-emerald-500"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                    <button className="flex-1 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      View Linked Candidates
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE DEMAND MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Register Demand
                Letter
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Demand Reference No.
                </label>
                <input
                  required
                  type="text"
                  value={formData.demandNo}
                  onChange={(e) =>
                    setFormData({ ...formData, demandNo: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono uppercase"
                  placeholder="e.g. DEM-KSA-2026-08"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Sponsoring Company
                </label>
                <input
                  required
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. Nesma & Partners"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  >
                    <option>Saudi Arabia</option>
                    <option>Malaysia</option>
                    <option>UAE</option>
                    <option>Qatar</option>
                    <option>Kuwait</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Quota Amount
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.quota}
                    onChange={(e) =>
                      setFormData({ ...formData, quota: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-blue-600"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Trade / Profession
                </label>
                <input
                  required
                  type="text"
                  value={formData.trade}
                  onChange={(e) =>
                    setFormData({ ...formData, trade: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. Pipe Fitter & Welder"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Demand Letter"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
