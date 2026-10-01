import { useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  Search,
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ChartOfAccounts() {
  const [accounts] = useState([
    // 1000 - ASSETS
    {
      code: "1010",
      name: "Cash in Hand",
      group: "Assets",
      type: "Current Asset",
      balance: 450000,
    },
    {
      code: "1020",
      name: "Islami Bank Bangladesh Ltd",
      group: "Assets",
      type: "Bank Account",
      balance: 1850000,
    },
    {
      code: "1030",
      name: "Dutch-Bangla Bank Ltd (DBBL)",
      group: "Assets",
      type: "Bank Account",
      balance: 920000,
    },
    {
      code: "1050",
      name: "Candidate Receivables (Due Package)",
      group: "Assets",
      type: "Current Asset",
      balance: 2845000,
    },

    // 2000 - LIABILITIES
    {
      code: "2010",
      name: "Sub-Agent Commission Payable",
      group: "Liabilities",
      type: "Current Liability",
      balance: 250000,
    },
    {
      code: "2020",
      name: "Airlines Ticket Payable",
      group: "Liabilities",
      type: "Current Liability",
      balance: 380000,
    },

    // 4000 - REVENUE
    {
      code: "4010",
      name: "Visa Processing Revenue",
      group: "Revenue",
      type: "Operating Income",
      balance: 4850000,
    },
    {
      code: "4020",
      name: "Air Ticket Commission",
      group: "Revenue",
      type: "Non-Operating Income",
      balance: 120000,
    },

    // 5000 - EXPENSES
    {
      code: "5010",
      name: "Embassy Visa Stamping Cost",
      group: "Expenses",
      type: "Direct Expense",
      balance: 1450000,
    },
    {
      code: "5020",
      name: "BMET Clearance & Smart Card Fee",
      group: "Expenses",
      type: "Direct Expense",
      balance: 420000,
    },
    {
      code: "5030",
      name: "Air Ticket Purchase Cost",
      group: "Expenses",
      type: "Direct Expense",
      balance: 1890000,
    },
    {
      code: "5050",
      name: "Office Rent & Utilities",
      group: "Expenses",
      type: "Administrative Expense",
      balance: 240000,
    },
  ]);

  const [filterGroup, setFilterGroup] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const totalAssets = accounts
    .filter((a) => a.group === "Assets")
    .reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts
    .filter((a) => a.group === "Liabilities")
    .reduce((sum, a) => sum + a.balance, 0);
  const totalRevenue = accounts
    .filter((a) => a.group === "Revenue")
    .reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = accounts
    .filter((a) => a.group === "Expenses")
    .reduce((sum, a) => sum + a.balance, 0);

  const coaStats = [
    {
      title: "Total Ledger Assets",
      value: `৳ ${(totalAssets / 100000).toFixed(2)} Lakh`,
      subtitle: "Cash, Banks & Candidate Dues",
      borderTop: "border-t-blue-600",
      icon: Wallet,
      iconColor: "text-blue-500",
    },
    {
      title: "Total Liabilities",
      value: `৳ ${(totalLiabilities / 100000).toFixed(2)} Lakh`,
      subtitle: "Agent & Airline Payables",
      borderTop: "border-t-amber-500",
      icon: TrendingDown,
      iconColor: "text-amber-500",
    },
    {
      title: "Total Revenue (YTD)",
      value: `৳ ${(totalRevenue / 100000).toFixed(2)} Lakh`,
      subtitle: "Visa & Air Ticket Income",
      borderTop: "border-t-emerald-500",
      icon: TrendingUp,
      iconColor: "text-emerald-500",
    },
    {
      title: "Operating Expenses",
      value: `৳ ${(totalExpenses / 100000).toFixed(2)} Lakh`,
      subtitle: "Embassy, BMET & Tickets",
      borderTop: "border-t-rose-500",
      icon: Layers,
      iconColor: "text-rose-500",
    },
  ];

  const filteredAccounts = accounts.filter((a) => {
    const matchesGroup = filterGroup === "All" || a.group === filterGroup;
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.includes(searchTerm) ||
      a.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-blue-600 shrink-0" />
            <span>Chart of Accounts (COA)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            General ledger master classification, accounting heads &amp;
            real-time balances.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-102 shrink-0 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span>Add Account Head</span>
        </button>
      </div>

      {/* 1. TOP 4 METRIC CARDS (DESKTOP 24PX, TABLET 20PX, MOBILE 18PX) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 w-full">
        {coaStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm border-t-4 ${stat.borderTop} hover:shadow-md transition-shadow flex flex-col justify-between`}
            >
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  {stat.title}
                </span>
                <h2 className="text-lg sm:text-xl lg:text-[24px] font-bold text-slate-900 leading-tight my-1 tracking-tight">
                  {stat.value}
                </h2>
              </div>

              <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium text-slate-500 text-[11px] sm:text-xs">
                  {stat.subtitle}
                </span>
                <Icon className={`w-4 h-4 ${stat.iconColor} shrink-0`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. TOOLBAR: SEARCH & CATEGORY FILTER TABS */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search account code, name, type..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["All", "Assets", "Liabilities", "Revenue", "Expenses"].map(
            (grp) => (
              <button
                key={grp}
                onClick={() => setFilterGroup(grp)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterGroup === grp
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {grp}
              </button>
            ),
          )}
        </div>
      </div>

      {/* 3. COA DATA ARCHITECTURE (NO BUBBLE BADGES — CLEAN TEXT + SOFT DOT) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
            <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-6 py-4">Account Code</th>
                <th className="px-6 py-4">Account Head Name</th>
                <th className="px-6 py-4">Category Group</th>
                <th className="px-6 py-4">Account Type</th>
                <th className="px-6 py-4 text-right">Current Balance (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400">
                    No ledger account heads found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((a) => (
                  <tr
                    key={a.code}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                        {a.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {a.name}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            a.group === "Assets"
                              ? "bg-blue-600"
                              : a.group === "Liabilities"
                                ? "bg-amber-500"
                                : a.group === "Revenue"
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                          }`}
                        ></span>
                        <span className="font-semibold text-slate-800 text-xs">
                          {a.group}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-500">{a.type}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ৳ {a.balance.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No ledger account heads found.
            </div>
          ) : (
            filteredAccounts.map((a) => (
              <div
                key={a.code}
                className="p-4 space-y-2.5 hover:bg-slate-50/50 transition-colors"
              >
                {/* Top Row: Code, Group (Clean Dot), Name */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {a.code}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            a.group === "Assets"
                              ? "bg-blue-600"
                              : a.group === "Liabilities"
                                ? "bg-amber-500"
                                : a.group === "Revenue"
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                          }`}
                        ></span>
                        <span className="text-xs font-semibold text-slate-700">
                          {a.group}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-1.5 truncate">
                      {a.name}
                    </h3>
                  </div>
                </div>

                {/* Bottom Row: Type & Balance */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-xs">
                  <span className="text-slate-500 text-[11px]">{a.type}</span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Balance
                    </span>
                    <strong className="font-mono font-bold text-slate-900 text-sm">
                      ৳ {a.balance.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="py-3 px-4 sm:px-6 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-1.5">
          <span>
            Showing {filteredAccounts.length} of {accounts.length} Account Heads
          </span>
          <span className="text-slate-400 font-medium">
            Auto-balanced Double-Entry System
          </span>
        </div>
      </div>
    </div>
  );
}
