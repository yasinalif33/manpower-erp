import {
  LayoutDashboard,
  Users,
  UserPlus,
  GitPullRequest,
  Briefcase,
  UserCheck,
  Wallet,
  Receipt,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  Plane,
  X,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  isMobileOpen,
  onClose,
  user,
}) {
  const isDrawerOpen = isOpen !== undefined ? isOpen : isMobileOpen;
  const closeDrawer = () => {
    if (setIsOpen) setIsOpen(false);
    if (onClose) onClose();
  };

  const handleNavClick = (id) => {
    setActiveTab(id);
    closeDrawer();
  };

  const menuGroups = [
    {
      title: "Core Operations",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "candidates", label: "All Candidates", icon: Users },
        { id: "add-candidate", label: "New Candidate", icon: UserPlus },
        { id: "pipeline", label: "Processing Pipeline", icon: GitPullRequest },
        { id: "flights", label: "Flight Schedule & Manifest", icon: Plane },
        { id: "demands", label: "Foreign Demands", icon: Briefcase },
        { id: "agents", label: "Sub-Agents", icon: UserCheck },
      ],
    },
    {
      title: "Financial Accounts (ERP)",
      items: [
        {
          id: "chart-of-accounts",
          label: "Chart of Accounts",
          icon: FileSpreadsheet,
        },
        { id: "vouchers", label: "Vouchers (Debit/Credit)", icon: Wallet },
        { id: "money-receipts", label: "Money Receipts", icon: Receipt },
      ],
    },
    {
      title: "Reports & Security",
      items: [
        { id: "reports", label: "Financial Reports", icon: BarChart3 },
        { id: "rbac", label: "Roles & Permissions", icon: ShieldCheck },
      ],
    },
  ];

  return (
    <>
      {isDrawerOpen && (
        <div
          onClick={closeDrawer}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B0F19] text-slate-300 flex flex-col h-screen border-r border-slate-800/80 select-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isDrawerOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-800/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20 shrink-0">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-sm tracking-wider text-white whitespace-nowrap">
                MANPOWER ERP
              </h1>
              <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                Operations &amp; Accounts Division
              </p>
            </div>
          </div>

          <button
            onClick={closeDrawer}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors ml-2"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">
                {group.title}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white border-l-2 border-blue-500 shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-blue-400"
                            : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      <span className="tracking-wide whitespace-nowrap truncate">
                        {item.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Profile Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#080B12] shrink-0">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 uppercase">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.name || "Loading..."}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    {user?.role || "Staff"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
