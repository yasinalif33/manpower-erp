import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Wallet,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Clock,
  Receipt,
  Plane,
} from "lucide-react";

export default function Dashboard({ setActiveTab }) {
  const { user } = useSelector((state) => state.auth);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/dashboard/stats`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium animate-pulse">
        Syncing live metrics from database...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.name.split(" ")[0] || "Admin"}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Here is what's happening with your agency today.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("money-receipts")}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
          >
            Issue Receipt
          </button>
          <button
            onClick={() => setActiveTab("add-candidate")}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-102"
          >
            Enroll Candidate
          </button>
        </div>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Active Pax
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">
                {stats.metrics.totalCandidates}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Received
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">
                ৳{(stats.metrics.totalReceived / 100000).toFixed(2)}L
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-rose-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Due (Market)
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">
                ৳{(stats.metrics.totalDue / 100000).toFixed(2)}L
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-indigo-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Gross Pipeline Value
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">
                ৳{(stats.metrics.totalRevenue / 100000).toFixed(2)}L
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Activity feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> Recent Enrollments
            </h3>
            <button
              onClick={() => setActiveTab("candidates")}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-2 flex-1">
            {stats.recentCandidates.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">
                No candidates enrolled yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.recentCandidates.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                        {c.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {c.fullName}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500">
                          {c.destinationCountry}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${c.stageDot}`}
                      ></span>
                      <span className="text-xs font-bold text-slate-700">
                        {c.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-500" /> Latest
              Transactions
            </h3>
            <button
              onClick={() => setActiveTab("money-receipts")}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              Ledger <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-2 flex-1">
            {stats.recentReceipts.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">
                No receipts issued yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.recentReceipts.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {r.candidate.fullName}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">
                        Receipt: {r.receiptNo} • {r.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600">
                        + ৳{r.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(r.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
