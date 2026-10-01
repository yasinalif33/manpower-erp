import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Wallet,
  Search,
  Plus,
  CheckCircle2,
  FileText,
  Building,
  Users,
  Plane,
  HelpCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Vouchers() {
  const { user } = useSelector((state) => state.auth);

  const [vouchers, setVouchers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    category: "Office Rent & Utility",
    amount: "",
    paymentMethod: "Cash",
    reference: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    agentId: "",
  });

  const fetchData = async () => {
    try {
      const [vouchersRes, agentsRes] = await Promise.all([
        fetch(`${API_URL}/api/vouchers`),
        fetch(`${API_URL}/api/agents`),
      ]);
      const vouchersData = await vouchersRes.json();
      const agentsData = await agentsRes.json();

      setVouchers(vouchersData);
      setAgents(agentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Ensure agentId is cleared if category is not Agent Commission
    const payload = {
      ...formData,
      issuedBy: user?.name || "System Admin",
      agentId: formData.category === "Agent Commission" ? formData.agentId : "",
    };

    try {
      const response = await fetch(`${API_URL}/api/vouchers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to post voucher");

      const data = await response.json();
      setSuccessMsg(`Voucher ${data.voucher.voucherNo} posted successfully!`);

      setFormData({
        ...formData,
        amount: "",
        reference: "",
        notes: "",
        agentId: "",
      });
      fetchData();

      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Office Rent & Utility":
        return <Building className="w-4 h-4 text-slate-500" />;
      case "Staff Salary":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "Agent Commission":
        return <Wallet className="w-4 h-4 text-emerald-500" />;
      case "Flight Ticket Purchase":
        return <Plane className="w-4 h-4 text-indigo-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredVouchers = vouchers.filter(
    (v) =>
      v.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-rose-600" /> Expense Vouchers
            (Debit)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Record outgoing expenses, commissions, and operational costs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Issue Voucher Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800">Post New Expense</h3>
            </div>

            <div className="p-5">
              {successMsg && (
                <div className="mb-5 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm font-semibold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Expense Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                  >
                    <option>Office Rent & Utility</option>
                    <option>Staff Salary</option>
                    <option>Agent Commission</option>
                    <option>Flight Ticket Purchase</option>
                    <option>Marketing & Promo</option>
                    <option>Other / Misc</option>
                  </select>
                </div>

                {formData.category === "Agent Commission" && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-emerald-700 mb-1.5 uppercase tracking-wide">
                      Select Agent to Pay
                    </label>
                    <select
                      required
                      value={formData.agentId}
                      onChange={(e) =>
                        setFormData({ ...formData, agentId: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 font-medium text-emerald-900"
                    >
                      <option value="">-- Choose Agent --</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (Due: ৳{a.dueAmount})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Amount (৳)
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-rose-600 focus:ring-2 focus:ring-rose-500/20"
                      placeholder="e.g. 15000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Date
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Payment Method
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Mobile Banking (Bkash/Nagad)</option>
                      <option>Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Reference No.
                    </label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) =>
                        setFormData({ ...formData, reference: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      placeholder="TrxID / Cheque No"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Particulars / Notes
                  </label>
                  <textarea
                    rows="2"
                    required
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    placeholder="Details about this expense..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-600/20 transition-all hover:scale-102 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitting ? (
                    "Processing..."
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Post Debit Voucher
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Expense Ledger */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Expense Ledger</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search vouchers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 min-w-[600px]">
                <thead className="bg-slate-50/50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Voucher Info</th>
                    <th className="px-4 py-3">Category & Details</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-8 text-center text-slate-400 text-xs"
                      >
                        Loading records...
                      </td>
                    </tr>
                  ) : filteredVouchers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-8 text-center text-slate-400 text-xs"
                      >
                        No expense vouchers found.
                      </td>
                    </tr>
                  ) : (
                    filteredVouchers.map((voucher) => (
                      <tr
                        key={voucher.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <FileText className="w-3 h-3 text-slate-400" />{" "}
                            {voucher.voucherNo}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(voucher.date).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                            {getCategoryIcon(voucher.category)}{" "}
                            {voucher.category}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                            {voucher.agent
                              ? `Paid to: ${voucher.agent.name}`
                              : voucher.notes}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200">
                            {voucher.paymentMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-black text-rose-600">
                            ৳ {voucher.amount.toLocaleString()}
                          </p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
