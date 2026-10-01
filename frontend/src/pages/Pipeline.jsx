import { useState, useEffect } from "react";
import {
  GitPullRequest,
  Search,
  Plane,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";

const STAGES = [
  {
    id: "Medical Fit",
    title: "Medical Fit",
    border: "border-t-emerald-500",
    dot: "bg-emerald-600",
    bg: "bg-emerald-50/30",
    text: "text-emerald-700",
  },
  {
    id: "Visa Stamping",
    title: "Visa Stamping",
    border: "border-t-indigo-500",
    dot: "bg-indigo-600",
    bg: "bg-indigo-50/30",
    text: "text-indigo-700",
  },
  {
    id: "BMET Smart Card",
    title: "BMET Smart Card",
    border: "border-t-blue-500",
    dot: "bg-blue-600",
    bg: "bg-blue-50/30",
    text: "text-blue-700",
  },
  {
    id: "Flight Ticket Issued",
    title: "Ticket Issued",
    border: "border-t-amber-500",
    dot: "bg-amber-600",
    bg: "bg-amber-50/30",
    text: "text-amber-700",
  },
  {
    id: "Departed (Fly Done)",
    title: "Departed",
    border: "border-t-slate-500",
    dot: "bg-slate-500",
    bg: "bg-slate-50/30",
    text: "text-slate-700",
  },
];

export default function Pipeline() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedId, setDraggedId] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch Candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/candidates");
        const data = await response.json();
        setCandidates(data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  // HTML5 Drag & Drop Handlers
  const handleDragStart = (e, candidateId) => {
    setDraggedId(candidateId);
    e.dataTransfer.effectAllowed = "move";
    // Small timeout ensures the dragged ghost image looks right while the original fades
    setTimeout(() => e.target.classList.add("opacity-50"), 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("opacity-50");
    setDraggedId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    if (!draggedId || updating) return;

    const candidate = candidates.find((c) => c.id === draggedId);
    if (candidate.stage === newStage) return;

    setUpdating(true);
    const targetStageConfig = STAGES.find((s) => s.id === newStage);

    try {
      // 1. Send update to PostgreSQL using the existing route
      const response = await fetch(
        "http://localhost:5000/api/candidates/bulk-stage",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateIds: [draggedId],
            stage: targetStageConfig.id,
            stageDot: targetStageConfig.dot,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to update stage in database");

      // 2. Update local state for immediate feedback
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === draggedId
            ? {
                ...c,
                stage: targetStageConfig.id,
                stageDot: targetStageConfig.dot,
              }
            : c,
        ),
      );
    } catch (error) {
      alert(`Sync Error: ${error.message}`);
    } finally {
      setUpdating(false);
      setDraggedId(null);
    }
  };

  // Filter for search bar
  const filteredCandidates = candidates.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.passportNo.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 h-full flex flex-col">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GitPullRequest className="w-6 h-6 text-blue-600" /> Processing
            Pipeline
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Drag and drop candidates across stages to update their immigration
            status.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, country, passport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full items-start">
          {STAGES.map((stage) => {
            const stageCandidates = filteredCandidates.filter(
              (c) => c.stage === stage.id,
            );

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`w-[320px] max-h-full flex flex-col rounded-xl border border-slate-200/80 bg-slate-100/50 shadow-sm overflow-hidden border-t-4 ${stage.border}`}
              >
                {/* Column Header */}
                <div
                  className={`p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white/60 backdrop-blur-sm`}
                >
                  <h3 className={`font-bold text-sm ${stage.text}`}>
                    {stage.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-black ${stage.bg} ${stage.text} border border-white`}
                  >
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Column Cards Container */}
                <div
                  className={`flex-1 overflow-y-auto p-3 space-y-3 ${updating ? "pointer-events-none opacity-60" : ""} transition-opacity`}
                >
                  {loading && stageCandidates.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 font-medium">
                      Loading...
                    </div>
                  ) : stageCandidates.length === 0 ? (
                    <div className="h-24 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium">
                      Drop candidate here
                    </div>
                  ) : (
                    stageCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidate.id)}
                        onDragEnd={handleDragEnd}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-slate-800 text-sm truncate pr-2 group-hover:text-blue-600 transition-colors">
                            {candidate.fullName}
                          </div>
                          <div className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0">
                            {candidate.passportNo}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                          <Plane className="w-3.5 h-3.5" />
                          <span className="font-medium truncate">
                            {candidate.destinationCountry} -{" "}
                            {candidate.companyName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                            <Clock className="w-3 h-3" />
                            {new Date(candidate.createdAt).toLocaleDateString()}
                          </div>

                          {candidate.dueAmount > 0 ? (
                            <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Due: ৳
                              {(candidate.dueAmount / 1000).toFixed(0)}k
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Paid
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
