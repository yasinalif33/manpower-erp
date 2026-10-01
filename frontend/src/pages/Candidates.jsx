import { useState, useEffect, useRef } from "react";
import {
  Search,
  UserPlus,
  Eye,
  Receipt,
  Download,
  Upload,
  FileText,
  X,
  Clock,
  Plane,
  ExternalLink,
  MessageSquare,
  Wallet,
  Users,
} from "lucide-react";

export default function Candidates({ setActiveTab }) {
  const fileInputRef = useRef(null);

  const [candidatesList, setCandidatesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const [selectedIds, setSelectedIds] = useState([]);
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [drawerTab, setDrawerTab] = useState("profile");

  // Fetch live data from PostgreSQL via Express
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/candidates");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setCandidatesList(data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(
        `Selected "${file.name}" for batch candidate import. File ready for processing!`,
      );
    }
  };

  const toggleSelectAll = () => {
    if (
      selectedIds.length === filteredCandidates.length &&
      filteredCandidates.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStageUpdate = async (newStage) => {
    const dotColors = {
      "Medical Fit": "bg-emerald-600",
      "Visa Stamping": "bg-indigo-600",
      "BMET Smart Card": "bg-blue-600",
      "Flight Ticket Issued": "bg-amber-600",
      "Departed (Fly Done)": "bg-slate-500",
    };

    const stageDot = dotColors[newStage] || "bg-blue-600";

    try {
      // 1. Send the update to PostgreSQL
      const response = await fetch(
        "http://localhost:5000/api/candidates/bulk-stage",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateIds: selectedIds,
            stage: newStage,
            stageDot,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to update database");

      // 2. Instantly update the local UI without needing to refresh the page
      setCandidatesList((prev) =>
        prev.map((c) => {
          if (selectedIds.includes(c.id)) {
            return { ...c, stage: newStage, stageDot };
          }
          return c;
        }),
      );

      alert(
        `Successfully moved ${selectedIds.length} candidate(s) to ${newStage}!`,
      );
      setSelectedIds([]); // Hide the floating action bar
    } catch (error) {
      alert(`Error updating stages: ${error.message}`);
    }
  };

  const filteredCandidates = candidatesList.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.passportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.agentName &&
        c.agentName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCountry =
      selectedCountry === "All" || c.destinationCountry === selectedCountry;

    const matchesStage = selectedStage === "All" || c.stage === selectedStage;

    const matchesPayment =
      paymentFilter === "All" ||
      (paymentFilter === "Due" && c.dueAmount > 0) ||
      (paymentFilter === "Paid" && c.dueAmount === 0);

    return matchesSearch && matchesCountry && matchesStage && matchesPayment;
  });

  const totalDue = candidatesList.reduce(
    (sum, c) => sum + (c.dueAmount || 0),
    0,
  );
  const inVisaCount = candidatesList.filter(
    (c) => c.stage === "Visa Stamping" || c.stage === "BMET Smart Card",
  ).length;
  const readyToFlyCount = candidatesList.filter(
    (c) => c.stage === "Flight Ticket Issued",
  ).length;

  const stats = [
    {
      title: "Total Candidates",
      value: `${candidatesList.length} Pax`,
      change: "Active enrolled",
      icon: Users,
      accentColor: "border-t-blue-600",
    },
    {
      title: "Under Visa & BMET",
      value: `${inVisaCount} Pax`,
      change: "In immigration pipeline",
      icon: Clock,
      accentColor: "border-t-amber-500",
    },
    {
      title: "Ready to Fly",
      value: `${readyToFlyCount} Pax`,
      change: "Confirmed ticket issued",
      icon: Plane,
      accentColor: "border-t-emerald-500",
    },
    {
      title: "Total Receivables (Due)",
      value: `৳ ${(totalDue / 100000).toFixed(2)} Lakh`,
      change: `From ${candidatesList.filter((c) => c.dueAmount > 0).length} candidates`,
      icon: Wallet,
      accentColor: "border-t-rose-500",
    },
  ];

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-6">
      {/* 1. TOP METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 w-full">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm border-t-4 ${stat.accentColor} hover:shadow-md transition-shadow flex flex-col justify-between`}
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
                  {stat.change}
                </span>
                <Icon className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. UNIFIED TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
            Candidates Directory &amp; Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository for candidate passports, visa stages &amp;
            financial ledgers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv, .xlsx, .xls"
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition-colors shadow-2xs flex-1 sm:flex-initial"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import</span>
          </button>
          <button className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition-colors shadow-2xs flex-1 sm:flex-initial">
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setActiveTab("add-candidate")}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all hover:scale-102 w-full sm:w-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Enroll Candidate</span>
          </button>
        </div>
      </div>

      {/* 3. SEARCH & INTEGRATED FILTER STRIP */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate name, passport no, mobile, agent..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Countries</option>
              <option value="Saudi Arabia">Saudi Arabia (KSA)</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Qatar">Qatar</option>
              <option value="UAE">United Arab Emirates</option>
            </select>
          </div>
          <div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Stages</option>
              <option value="Medical Fit">Medical Fit</option>
              <option value="Visa Stamping">Visa Stamping</option>
              <option value="BMET Smart Card">BMET Smart Card</option>
              <option value="Flight Ticket Issued">Flight Ticket Issued</option>
              <option value="Departed (Fly Done)">Departed (Fly Done)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-500 font-semibold text-[10px] sm:text-[11px] uppercase mr-1">
              Payment:
            </span>
            {["All", "Due", "Paid"].map((f) => (
              <button
                key={f}
                onClick={() => setPaymentFilter(f)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  paymentFilter === f
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f === "All"
                  ? "All"
                  : f === "Due"
                    ? "Outstanding Due"
                    : "Paid in Full"}
              </button>
            ))}
          </div>

          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Showing{" "}
            <strong className="text-slate-800">
              {filteredCandidates.length}
            </strong>{" "}
            of {candidatesList.length}
          </span>
        </div>
      </div>

      {/* 4. ENTERPRISE DATA TABLE */}
      <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[760px]">
            <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200 tracking-wider">
              <tr>
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredCandidates.length &&
                      filteredCandidates.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3.5">Candidate Details</th>
                <th className="px-5 py-3.5">
                  Passport &amp; Sponsoring Demand
                </th>
                <th className="px-5 py-3.5">Processing Stage</th>
                <th className="px-5 py-3.5">Financial Ledger (৳)</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-12 text-slate-500 font-medium text-sm"
                  >
                    Loading candidates from database...
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    No candidates found matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  const paidPercent = Math.min(
                    100,
                    Math.round(
                      ((c.paidAmount || 0) / (c.totalPackageAmount || 1)) * 100,
                    ),
                  );

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/70 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(c.id)}
                          className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="px-5 py-3.5">
                        <div>
                          <p
                            onClick={() => {
                              setActiveCandidate(c);
                              setDrawerTab("profile");
                            }}
                            className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors text-xs"
                          >
                            {c.fullName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {c.trade}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {c.phone}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div>
                          <div className="flex items-center gap-1.5 font-mono font-medium text-slate-800">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              {c.passportNo}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans">
                              Exp: {c.passportExpiryDate || "N/A"}
                            </span>
                          </div>
                          <p className="text-slate-800 font-medium truncate max-w-[190px] mt-0.5">
                            {c.companyName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {c.destinationCountry} • Agent:{" "}
                            {c.agentName || "Direct"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${c.stageDot} shrink-0`}
                          ></span>
                          <span className="font-semibold text-slate-800 text-xs">
                            {c.stage}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 ml-4">
                          Enrolled: {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-800 font-bold">
                              ৳ {(c.paidAmount || 0).toLocaleString()}
                            </span>
                            {c.dueAmount > 0 ? (
                              <span className="text-rose-600 font-bold">
                                ৳ {c.dueAmount.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-semibold font-sans">
                                Paid
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${c.dueAmount === 0 ? "bg-emerald-500" : "bg-blue-600"}`}
                              style={{ width: `${paidPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Total: ৳{" "}
                            {(c.totalPackageAmount || 0).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setActiveCandidate(c);
                              setDrawerTab("profile");
                            }}
                            title="View Profile"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveTab("money-receipts")}
                            title="Money Receipt"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://wa.me/88${c.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            title="WhatsApp"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="text-center py-10 text-slate-500 font-medium text-xs">
              Loading candidates...
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No candidates found matching selected criteria.
            </div>
          ) : (
            filteredCandidates.map((c) => {
              const isSelected = selectedIds.includes(c.id);
              const paidPercent = Math.min(
                100,
                Math.round(
                  ((c.paidAmount || 0) / (c.totalPackageAmount || 1)) * 100,
                ),
              );

              return (
                <div
                  key={c.id}
                  className={`p-4 space-y-3 transition-colors ${isSelected ? "bg-blue-50/40" : "bg-white"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(c.id)}
                        className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 shrink-0"
                      />
                      <div className="min-w-0">
                        <p
                          onClick={() => {
                            setActiveCandidate(c);
                            setDrawerTab("profile");
                          }}
                          className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer truncate"
                        >
                          {c.fullName}
                        </p>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {c.trade}
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-700 shrink-0">
                      <span
                        className={`w-2 h-2 rounded-full ${c.stageDot}`}
                      ></span>
                      <span>{c.stage}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">
                        Passport:
                      </span>
                      <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200/70 text-[11px]">
                        {c.passportNo}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">
                        Destination &amp; Company:
                      </span>
                      <span className="font-medium text-slate-800 text-right truncate max-w-[180px]">
                        {c.destinationCountry} ({c.companyName})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">Agent:</span>
                      <span className="font-medium text-slate-700">
                        {c.agentName || "Direct"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-600">
                        Paid:{" "}
                        <strong className="text-slate-900 font-bold">
                          ৳ {(c.paidAmount || 0).toLocaleString()}
                        </strong>
                      </span>
                      <span
                        className={
                          c.dueAmount > 0
                            ? "text-rose-600 font-bold"
                            : "text-emerald-600 font-bold"
                        }
                      >
                        {c.dueAmount > 0
                          ? `Due: ৳ ${c.dueAmount.toLocaleString()}`
                          : "Fully Paid"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${c.dueAmount === 0 ? "bg-emerald-500" : "bg-blue-600"}`}
                        style={{ width: `${paidPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setActiveCandidate(c);
                        setDrawerTab("profile");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex-1 justify-center"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Bio
                    </button>

                    <button
                      onClick={() => setActiveTab("money-receipts")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-3 py-1.5 rounded-lg transition-colors flex-1 justify-center"
                    >
                      <Receipt className="w-3.5 h-3.5" /> Receipt
                    </button>

                    <a
                      href={`https://wa.me/88${c.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg transition-colors shrink-0"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. FLOATING BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 z-40 w-[92%] sm:w-auto max-w-lg">
          <span className="text-xs font-semibold whitespace-nowrap">
            <strong className="text-blue-400">{selectedIds.length}</strong>{" "}
            Selected
          </span>

          <div className="h-4 w-px bg-slate-700 hidden sm:block shrink-0"></div>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-400 hidden sm:inline whitespace-nowrap">
              Stage:
            </span>
            <select
              onChange={(e) => {
                if (e.target.value) handleBulkStageUpdate(e.target.value);
              }}
              defaultValue=""
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 text-white focus:outline-none w-full sm:w-auto"
            >
              <option value="" disabled>
                Change Stage...
              </option>
              <option value="Medical Fit">Medical Fit</option>
              <option value="Visa Stamping">Visa Stamping</option>
              <option value="BMET Smart Card">BMET Smart Card</option>
              <option value="Flight Ticket Issued">Flight Ticket Issued</option>
              <option value="Departed (Fly Done)">Departed (Fly Done)</option>
            </select>
          </div>

          <button
            onClick={() => setSelectedIds([])}
            className="text-xs text-slate-400 hover:text-white underline shrink-0 ml-1"
          >
            Clear
          </button>
        </div>
      )}

      {/* 6. SLIDE-OVER CANDIDATE PROFILE DRAWER */}
      {activeCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50">
          <div className="bg-white w-full sm:max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeCandidate.fullName}
                </h3>
                <p className="text-xs text-blue-600 font-medium">
                  {activeCandidate.trade}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Passport: {activeCandidate.passportNo}
                </p>
              </div>
              <button
                onClick={() => setActiveCandidate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-slate-200 px-4 sm:px-5 gap-4 sm:gap-6 text-xs font-semibold bg-white overflow-x-auto shrink-0">
              {[
                { id: "profile", label: "Bio-Data" },
                { id: "timeline", label: "Timeline" },
                { id: "ledger", label: "Accounts Ledger" },
                { id: "documents", label: "Documents" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDrawerTab(t.id)}
                  className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
                    drawerTab === t.id
                      ? "border-blue-600 text-blue-600 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
              {drawerTab === "profile" && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-800 text-xs">
                      Identity Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          Father's Name
                        </span>
                        <strong className="text-slate-800">
                          {activeCandidate.fatherName || "N/A"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          National ID (NID)
                        </span>
                        <span className="font-mono text-slate-800">
                          {activeCandidate.nid || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          Date of Birth
                        </span>
                        <span>{activeCandidate.dateOfBirth || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          District
                        </span>
                        <span>{activeCandidate.district || "N/A"}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-[10px]">
                          Phone Number
                        </span>
                        <span className="font-mono text-slate-900 font-semibold">
                          {activeCandidate.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-800 text-xs">
                      Sponsoring Employer &amp; Agency
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          Country
                        </span>
                        <strong className="text-slate-800">
                          {activeCandidate.destinationCountry}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          Company
                        </span>
                        <strong className="text-slate-800">
                          {activeCandidate.companyName}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          Demand Ref
                        </span>
                        <span className="font-mono text-blue-600 font-medium">
                          {activeCandidate.demandNo || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          Referral Agent
                        </span>
                        <span>{activeCandidate.agentName || "Direct"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === "timeline" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs">
                    Immigration Processing History
                  </h4>
                  <div className="relative pl-5 space-y-5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {[
                      {
                        title: "Candidate Registration",
                        date: new Date(
                          activeCandidate.createdAt,
                        ).toLocaleDateString(),
                        done: true,
                      },
                      {
                        title: "GAMCA Medical Examination (Fit)",
                        date:
                          activeCandidate.stage !== "Medical Fit"
                            ? "Completed"
                            : "Current",
                        done: activeCandidate.stage !== "Medical Fit",
                      },
                      {
                        title: "Visa Stamping (Embassy)",
                        date:
                          activeCandidate.stage === "BMET Smart Card" ||
                          activeCandidate.stage === "Flight Ticket Issued" ||
                          activeCandidate.stage === "Departed (Fly Done)"
                            ? "Completed"
                            : "Pending",
                        done:
                          activeCandidate.stage === "BMET Smart Card" ||
                          activeCandidate.stage === "Flight Ticket Issued" ||
                          activeCandidate.stage === "Departed (Fly Done)",
                      },
                      {
                        title: "BMET Smart Card & Clearance",
                        date:
                          activeCandidate.stage === "Flight Ticket Issued" ||
                          activeCandidate.stage === "Departed (Fly Done)"
                            ? "Completed"
                            : "Pending",
                        done:
                          activeCandidate.stage === "Flight Ticket Issued" ||
                          activeCandidate.stage === "Departed (Fly Done)",
                      },
                      {
                        title: "Flight Ticket & Departure",
                        date:
                          activeCandidate.stage === "Departed (Fly Done)"
                            ? "Departed"
                            : "Pending",
                        done: activeCandidate.stage === "Departed (Fly Done)",
                      },
                    ].map((step, idx) => (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                            step.done
                              ? "bg-emerald-600 border-emerald-600"
                              : "bg-white border-slate-300"
                          }`}
                        />
                        <div className="flex justify-between gap-2">
                          <p className="font-semibold text-slate-800">
                            {step.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {step.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerTab === "ledger" && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        Current Outstanding Due
                      </span>
                      <p className="text-xl font-bold text-rose-400">
                        ৳ {(activeCandidate.dueAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("money-receipts")}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Receive Payment
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Total Agreed Package:</span>
                      <strong className="text-slate-800">
                        ৳{" "}
                        {(
                          activeCandidate.totalPackageAmount || 0
                        ).toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Paid:</span>
                      <strong className="text-emerald-600">
                        ৳ {(activeCandidate.paidAmount || 0).toLocaleString()}
                      </strong>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold">
                      <span>Remaining Balance:</span>
                      <span className="text-rose-600">
                        ৳ {(activeCandidate.dueAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === "documents" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs">
                    Attached Digital Records
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: "Passport Bio Page", size: "2.4 MB" },
                      { name: "Medical Fit Report", size: "1.1 MB" },
                      { name: "Police Clearance", size: "850 KB" },
                      { name: "BMET Smart Card", size: "1.5 MB" },
                    ].map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5"
                      >
                        <FileText className="w-5 h-5 text-blue-600" />
                        <p className="font-semibold text-slate-800 truncate">
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{doc.size}</p>
                        <button className="text-[10px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                          View File <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <a
                href={`https://wa.me/88${activeCandidate.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
              <button
                onClick={() => setActiveCandidate(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-100"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
