import { useState, useEffect } from "react";
import {
  Plane,
  Plus,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Search,
  X,
  MapPin,
} from "lucide-react";

export default function FlightSchedule({ setActiveTab }) {
  const [flights, setFlights] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [activeManifestFlight, setActiveManifestFlight] = useState(null);

  const [flightForm, setFlightForm] = useState({
    flightNumber: "",
    airline: "",
    departureDate: "",
    sector: "",
  });

  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const [flightsRes, candidatesRes] = await Promise.all([
        fetch(`${API_URL}/api/flights`),
        fetch(`${API_URL}/api/candidates`),
      ]);
      const flightsData = await flightsRes.json();
      const candidatesData = await candidatesRes.json();

      setFlights(flightsData);
      setCandidates(candidatesData);
    } catch (error) {
      console.error("Error loading flight data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateFlight = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/flights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flightForm),
      });
      if (!res.ok) throw new Error("Failed to create flight");

      setFlightForm({
        flightNumber: "",
        airline: "",
        departureDate: "",
        sector: "",
      });
      setIsFlightModalOpen(false);
      fetchData();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateManifest = async () => {
    if (selectedCandidateIds.length === 0) return;
    try {
      const res = await fetch(
        `${API_URL}/api/flights/${activeManifestFlight.id}/assign`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateIds: selectedCandidateIds }),
        },
      );
      if (!res.ok) throw new Error("Failed to assign candidates");

      alert('Manifest updated! Candidates moved to "Ticket Issued" stage.');
      setActiveManifestFlight(null);
      setSelectedCandidateIds([]);
      fetchData();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDepartFlight = async (flightId) => {
    if (
      !window.confirm(
        "Are you sure? This will permanently mark the flight and all attached candidates as Departed.",
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/api/flights/${flightId}/depart`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to depart flight");

      alert("Flight departed! All passengers updated.");
      fetchData();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Only show candidates who don't already have a flight and are somewhat ready
  const availableCandidates = candidates.filter(
    (c) =>
      !c.flightId &&
      c.stage !== "Departed (Fly Done)" &&
      (c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.passportNo.includes(searchTerm)),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Plane className="w-6 h-6 text-blue-600" /> Flight Schedule &
            Manifests
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage outbound flights and passenger allocation.
          </p>
        </div>
        <button
          onClick={() => setIsFlightModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Schedule Flight
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">
            Loading flight schedules...
          </div>
        ) : flights.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium bg-white rounded-xl border border-slate-200">
            No flights scheduled.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-8">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden"
              >
                <div
                  className={`p-4 border-b flex justify-between items-center ${flight.status === "Departed" ? "bg-slate-50 border-slate-200" : "bg-blue-50/50 border-blue-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${flight.status === "Departed" ? "bg-slate-200 text-slate-500" : "bg-blue-100 text-blue-600"}`}
                    >
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {flight.airline}
                      </h3>
                      <p className="text-xs font-mono text-slate-500">
                        {flight.flightNumber}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${flight.status === "Departed" ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {flight.status}
                  </span>
                </div>

                <div className="p-4 space-y-4 flex-1">
                  <div className="flex justify-between items-center text-sm font-medium text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />{" "}
                      {flight.sector}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />{" "}
                      {new Date(flight.departureDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-xs font-bold text-slate-500 uppercase">
                        Passenger Manifest
                      </p>
                      <p className="text-sm font-black text-slate-900">
                        {flight.candidates.length} Pax
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 h-32 overflow-y-auto">
                      {flight.candidates.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-8">
                          Manifest empty
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {flight.candidates.map((c) => (
                            <div
                              key={c.id}
                              className="flex justify-between items-center text-xs p-1.5 bg-white rounded border border-slate-200"
                            >
                              <span className="font-semibold text-slate-800 truncate pr-2">
                                {c.fullName}
                              </span>
                              <span className="font-mono text-slate-500 shrink-0">
                                {c.passportNo}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {flight.status !== "Departed" && (
                  <div className="p-3 border-t border-slate-100 flex gap-2 bg-slate-50">
                    <button
                      onClick={() => setActiveManifestFlight(flight)}
                      className="flex-1 py-2 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Users className="w-4 h-4" /> Edit Manifest
                    </button>
                    <button
                      onClick={() => handleDepartFlight(flight.id)}
                      className="flex-1 py-2 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Departed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE FLIGHT MODAL */}
      {isFlightModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Schedule New Flight</h3>
              <button
                onClick={() => setIsFlightModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFlight} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Airlines Name
                </label>
                <input
                  required
                  type="text"
                  value={flightForm.airline}
                  onChange={(e) =>
                    setFlightForm({ ...flightForm, airline: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm"
                  placeholder="e.g. Biman Bangladesh"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Flight Number
                </label>
                <input
                  required
                  type="text"
                  value={flightForm.flightNumber}
                  onChange={(e) =>
                    setFlightForm({
                      ...flightForm,
                      flightNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm uppercase"
                  placeholder="e.g. BG-135"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Date
                  </label>
                  <input
                    required
                    type="date"
                    value={flightForm.departureDate}
                    onChange={(e) =>
                      setFlightForm({
                        ...flightForm,
                        departureDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sector (Route)
                  </label>
                  <input
                    required
                    type="text"
                    value={flightForm.sector}
                    onChange={(e) =>
                      setFlightForm({ ...flightForm, sector: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm uppercase"
                    placeholder="DAC-RUH"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all"
              >
                Save Flight
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MANIFEST BUILDER MODAL */}
      {activeManifestFlight && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900">
                  Build Manifest: {activeManifestFlight.flightNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeManifestFlight.airline} • {activeManifestFlight.sector}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveManifestFlight(null);
                  setSelectedCandidateIds([]);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search available candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
              {availableCandidates.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">
                  No available candidates found to assign.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableCandidates.map((c) => {
                    const isSelected = selectedCandidateIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          if (isSelected)
                            setSelectedCandidateIds(
                              selectedCandidateIds.filter((id) => id !== c.id),
                            );
                          else
                            setSelectedCandidateIds([
                              ...selectedCandidateIds,
                              c.id,
                            ]);
                        }}
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${isSelected ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-slate-200 hover:border-blue-300"}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 pointer-events-none"
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">
                            {c.fullName}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {c.destinationCountry} • Pass: {c.passportNo} •
                            Stage: {c.stage}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700">
                {selectedCandidateIds.length} Selected
              </span>
              <button
                onClick={handleUpdateManifest}
                disabled={selectedCandidateIds.length === 0}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all"
              >
                Add to Manifest & Issue Tickets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
