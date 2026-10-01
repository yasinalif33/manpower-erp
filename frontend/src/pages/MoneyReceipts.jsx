import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Receipt,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText,
  Wallet,
} from "lucide-react";

export default function MoneyReceipts() {
  // Grab the logged-in user from Redux to stamp on the receipt
  const { user } = useSelector((state) => state.auth);

  const [candidates, setCandidates] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    candidateId: "",
    amount: "",
    paymentMethod: "Cash",
    reference: "",
    notes: "",
    date: new Date().toISOString().slice(0, 10),
  });

  // Load Data
  const fetchData = async () => {
    try {
      const [candRes, recRes] = await Promise.all([
        fetch(`${API_URL}/api/candidates`),
        fetch(`${API_URL}/api/receipts`),
      ]);
      const candData = await candRes.json();
      const recData = await recRes.json();

      setCandidates(candData);
      setReceipts(recData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedCandidate = candidates.find(
    (c) => c.id === formData.candidateId,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.candidateId || !formData.amount) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/receipts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          receivedBy: user?.name || "System Admin",
        }),
      });

      if (!response.ok) throw new Error("Failed to issue receipt");

      const data = await response.json();
      setSuccessMsg(
        `Receipt ${data.receipt.receiptNo} generated successfully!`,
      );

      // Reset form & refresh data to get updated balances
      setFormData({
        ...formData,
        candidateId: "",
        amount: "",
        reference: "",
        notes: "",
      });
      fetchData();

      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" /> Payment Receipts
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Issue new receipts and track candidate payment history.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Issue Receipt Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800">Issue New Receipt</h3>
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
                    Select Candidate
                  </label>
                  <select
                    required
                    value={formData.candidateId}
                    onChange={(e) =>
                      setFormData({ ...formData, candidateId: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  >
                    <option value="">-- Choose from Directory --</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.passportNo}) - Due: ৳
                        {c.dueAmount?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCandidate && (
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">
                      Outstanding Due:
                    </span>
                    <span className="font-black text-rose-600">
                      ৳ {selectedCandidate.dueAmount?.toLocaleString()}
                    </span>
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
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. 50000"
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
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20"
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
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
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
                    Admin Note
                  </label>
                  <textarea
                    rows="2"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    placeholder="Optional remarks..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !formData.candidateId}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-102 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitting ? (
                    "Processing..."
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Issue Receipt & Update
                      Balance
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Ledger Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">
                Recent Transactions Ledger
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search receipt no..."
                  className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 min-w-[600px]">
                <thead className="bg-slate-50/50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Receipt Info</th>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Method & Ref</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-slate-400 text-xs"
                      >
                        Loading records...
                      </td>
                    </tr>
                  ) : receipts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-slate-400 text-xs"
                      >
                        No receipts generated yet.
                      </td>
                    </tr>
                  ) : (
                    receipts.map((receipt) => (
                      <tr
                        key={receipt.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800 text-xs">
                            {receipt.receiptNo}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(receipt.date).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-700 text-xs">
                            {receipt.candidate.fullName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {receipt.candidate.passportNo}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                            <Wallet className="w-3 h-3" />{" "}
                            {receipt.paymentMethod}
                          </div>
                          {receipt.reference && (
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                              Ref: {receipt.reference}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-black text-emerald-600">
                            ৳ {receipt.amount.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 text-[10px] font-bold">
                            <Printer className="w-3.5 h-3.5" /> Print
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
      </div>
    </div>
  );
}
