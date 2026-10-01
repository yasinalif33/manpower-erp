import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import NewCandidate from "./pages/NewCandidate";
import Pipeline from "./pages/Pipeline";
import Demands from "./pages/Demands";
import SubAgents from "./pages/SubAgents";
import FlightSchedule from "./pages/FlightSchedule";
import MoneyReceipts from "./pages/MoneyReceipts";
import Vouchers from "./pages/Vouchers";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import Reports from "./pages/Reports";
import RBAC from "./pages/RBAC";

export default function App() {
  // Pull auth state from Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mainScrollRef = useRef(null);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [activeTab]);

  // THE GUARD: If not authenticated, render Login and stop here.
  if (!isAuthenticated) {
    return <Login />;
  }

  // If authenticated, render the ERP
  return (
    <div className="flex h-screen bg-slate-100/70 font-sans antialiased overflow-hidden selection:bg-blue-100 selection:text-blue-800">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          user={user}
        />

        <main
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden"
        >
          {activeTab === "dashboard" && (
            <Dashboard setActiveTab={setActiveTab} />
          )}
          {activeTab === "candidates" && (
            <Candidates setActiveTab={setActiveTab} />
          )}
          {activeTab === "add-candidate" && (
            <NewCandidate setActiveTab={setActiveTab} />
          )}
          {activeTab === "pipeline" && <Pipeline />}
          {activeTab === "flights" && <FlightSchedule />}
          {activeTab === "demands" && <Demands setActiveTab={setActiveTab} />}
          {activeTab === "agents" && <SubAgents setActiveTab={setActiveTab} />}
          {activeTab === "money-receipts" && (
            <MoneyReceipts setActiveTab={setActiveTab} />
          )}
          {activeTab === "vouchers" && <Vouchers setActiveTab={setActiveTab} />}
          {activeTab === "chart-of-accounts" && (
            <ChartOfAccounts setActiveTab={setActiveTab} />
          )}
          {activeTab === "reports" && <Reports setActiveTab={setActiveTab} />}
          {activeTab === "rbac" && <RBAC setActiveTab={setActiveTab} />}
        </main>
      </div>
    </div>
  );
}
