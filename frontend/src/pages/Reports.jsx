import { useState, useEffect } from "react";
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertCircle,
  Building,
  Users,
  Wallet,
  Plane,
  HelpCircle,
} from "lucide-react";

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/reports/financials");
        if (!res.ok) throw new Error("Failed to fetch report");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Office Rent & Utility":
        return <Building className="w-5 h-5 text-slate-500" />;
      case "Staff Salary":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "Agent Commission":
        return <Wallet className="w-5 h-5 text-emerald-500" />;
      case "Flight Ticket Purchase":
        return <Plane className="w-5 h-5 text-indigo-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
        Calculating master ledger...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <PieChart className="w-7 h-7 text-blue-600" /> Financial Reports &
            P&L
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Real-time profit & loss, cash flow, and expense breakdown.
          </p>
        </div>
        <button className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition-all">
          Export Master PDF
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Total Contracted Revenue
          </p>
          <h3 className="text-2xl lg:text-3xl font-black text-slate-900">
            ৳ {(data.expectedRevenue / 100000).toFixed(2)}L
          </h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Gross value of all active files
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Cash Inflow (Collected)
              </p>
              <h3 className="text-2xl lg:text-3xl font-black text-emerald-600">
                ৳ {(data.totalReceived / 100000).toFixed(2)}L
              </h3>
            </div>
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            From Money Receipts
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-rose-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Cash Outflow (Expenses)
              </p>
              <h3 className="text-2xl lg:text-3xl font-black text-rose-600">
                ৳ {(data.totalExpenses / 100000).toFixed(2)}L
              </h3>
            </div>
            <TrendingDown className="w-6 h-6 text-rose-500" />
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            From Debit Vouchers
          </p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Net Cash on Hand
              </p>
              <h3 className="text-2xl lg:text-3xl font-black text-blue-400">
                ৳ {(data.netCash / 100000).toFixed(2)}L
              </h3>
            </div>
            <DollarSign className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Current liquid capital
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Breakdown Category (Takes 2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800">
              Expense Breakdown by Category
            </h3>
          </div>
          <div className="p-6 flex-1">
            {data.expensesByCategory.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-12">
                No expenses recorded yet.
              </p>
            ) : (
              <div className="space-y-6">
                {data.expensesByCategory.map((exp, index) => {
                  const percent = (
                    (exp.amount / data.totalExpenses) *
                    100
                  ).toFixed(1);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(exp.category)}
                          <span className="font-bold text-slate-700">
                            {exp.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-slate-900">
                            ৳ {exp.amount.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-400 ml-2">
                            ({percent}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Business Health & Receivables */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-800">
                Accounts Receivable (Market Due)
              </h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-slate-500 font-medium mb-2">
                Total outstanding candidate payments
              </p>
              <p className="text-4xl font-black text-amber-500">
                ৳ {(data.totalDue / 100000).toFixed(2)}L
              </p>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-700 font-semibold">
                This capital is currently locked in the market. Focus on
                collections to increase Net Cash.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">
                Profit Margin Tracker
              </h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-emerald-600">Total Income</span>
                <span className="font-bold text-rose-600">Total Expense</span>
              </div>
              <div className="w-full h-4 rounded-full flex overflow-hidden">
                <div
                  className="bg-emerald-500 h-full"
                  style={{
                    width: `${(data.totalReceived / (data.totalReceived + data.totalExpenses)) * 100 || 50}%`,
                  }}
                ></div>
                <div
                  className="bg-rose-500 h-full"
                  style={{
                    width: `${(data.totalExpenses / (data.totalReceived + data.totalExpenses)) * 100 || 50}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
