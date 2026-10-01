import { useState, useEffect } from "react";
import {
  User,
  FileText,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Building2,
} from "lucide-react";

export default function NewCandidate({ setActiveTab }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [agents, setAgents] = useState([]);
  const [demands, setDemands] = useState([]); // Added live demands array

  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    phone: "",
    nid: "",
    dateOfBirth: "",
    district: "",
    passportNo: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    destinationCountry: "Saudi Arabia",
    companyName: "",
    trade: "",
    demandNo: "", // Linked to demands
    agentId: "",
    agentName: "",
    totalPackageAmount: "",
    advanceAmount: "",
  });

  // Fetch live agents & demands in parallel
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/agents`).then((res) => res.json()),
      fetch(`${API_URL}/api/demands`).then((res) => res.json()),
    ])
      .then(([agentsData, demandsData]) => {
        setAgents(agentsData);
        setDemands(demandsData);
      })
      .catch((err) => console.error("Failed to load form data", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");

      alert(`Candidate "${data.candidate.fullName}" successfully enrolled!`);
      setActiveTab("candidates");
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAgentSelect = (e) => {
    const selectedId = e.target.value;
    const selectedAgent = agents.find((a) => a.id === selectedId);
    setFormData({
      ...formData,
      agentId: selectedId,
      agentName: selectedAgent ? selectedAgent.name : "",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm text-center">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Enroll New Candidate
        </h2>
        <p className="text-sm text-slate-500 mt-1">Step {step} of 3</p>

        <div className="flex justify-center items-center gap-4 mt-6 mb-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}
          >
            <User className="w-5 h-5" />
          </div>
          <div
            className={`w-12 h-1 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-slate-100"}`}
          ></div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}
          >
            <Building2 className="w-5 h-5" />
          </div>
          <div
            className={`w-12 h-1 rounded-full ${step >= 3 ? "bg-blue-600" : "bg-slate-100"}`}
          ></div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}
          >
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/90 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: BIO-DATA */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                Candidate Bio-Data
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) =>
                      setFormData({ ...formData, fatherName: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PASSPORT & DEPLOYMENT */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                Passport & Deployment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Passport No
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.passportNo}
                    onChange={(e) =>
                      setFormData({ ...formData, passportNo: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Destination Country
                  </label>
                  <select
                    value={formData.destinationCountry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        destinationCountry: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option>Saudi Arabia</option>
                    <option>Malaysia</option>
                    <option>UAE</option>
                    <option>Qatar</option>
                    <option>Kuwait</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Trade / Profession
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.trade}
                    onChange={(e) =>
                      setFormData({ ...formData, trade: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Company Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* NEW: LIVE DEMANDS DROPDOWN */}
                <div>
                  <label className="block text-xs font-bold text-blue-700 mb-1.5 uppercase">
                    Demand / Quota Slot
                  </label>
                  <select
                    value={formData.demandNo}
                    onChange={(e) =>
                      setFormData({ ...formData, demandNo: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="">None / Open Category</option>
                    {demands.map((demand) => (
                      <option key={demand.id} value={demand.demandNo}>
                        {demand.demandNo} ({demand.companyName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* LIVE SUB-AGENTS DROPDOWN */}
                <div>
                  <label className="block text-xs font-bold text-emerald-700 mb-1.5 uppercase">
                    Referral Sub-Agent
                  </label>
                  <select
                    value={formData.agentId}
                    onChange={handleAgentSelect}
                    className="w-full px-3 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  >
                    <option value="">Direct / No Agent</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({agent.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FINANCIALS */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                Financial Contract
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Total Package Amount (৳)
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.totalPackageAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalPackageAmount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Advance Payment (৳)
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.advanceAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        advanceAmount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FORM NAVIGATION */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-102 disabled:opacity-50"
            >
              {submitting ? (
                "Processing..."
              ) : step === 3 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Complete
                </>
              ) : (
                <>
                  Next <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
