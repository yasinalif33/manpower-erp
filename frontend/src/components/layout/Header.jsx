import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import {
  Search,
  Bell,
  Command,
  X,
  ArrowRight,
  Users,
  Wallet,
  GitPullRequest,
  Receipt,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  Briefcase,
  UserPlus,
  Plus,
  Menu,
} from "lucide-react";

export default function Header({
  setActiveTab,
  toggleSidebar,
  onMenuClick,
  user,
}) {
  const dispatch = useDispatch();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggleMenu = onMenuClick || toggleSidebar || (() => {});

  const handleLogout = () => {
    dispatch(logout());
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const quickLinks = [
    {
      title: "Dashboard Overview",
      tab: "dashboard",
      icon: BarChart3,
      desc: "Real-time financial analytics & live pipeline",
      category: "General",
    },
    {
      title: "Candidates Directory",
      tab: "candidates",
      icon: Users,
      desc: "Manage registered candidates & passport ledger",
      category: "Operations",
    },
    {
      title: "Enroll New Candidate",
      tab: "add-candidate",
      icon: UserPlus,
      desc: "3-step candidate registration wizard",
      category: "Operations",
    },
    {
      title: "Processing Pipeline",
      tab: "pipeline",
      icon: GitPullRequest,
      desc: "Visual Kanban board for visa & BMET stages",
      category: "Operations",
    },
    {
      title: "Foreign Demands & Quota",
      tab: "demands",
      icon: Briefcase,
      desc: "Track overseas company demand letters",
      category: "Operations",
    },
    {
      title: "Sub-Agents Ledger",
      tab: "agents",
      icon: Users,
      desc: "Field brokers, referral tracking & commissions",
      category: "Operations",
    },
    {
      title: "Issue Money Receipt",
      tab: "money-receipts",
      icon: Receipt,
      desc: "Generate & print installment money receipts",
      category: "Accounts",
    },
    {
      title: "Post Double-Entry Voucher",
      tab: "vouchers",
      icon: Wallet,
      desc: "Debit, credit, journal & contra vouchers",
      category: "Accounts",
    },
    {
      title: "Chart of Accounts (COA)",
      tab: "chart-of-accounts",
      icon: FileSpreadsheet,
      desc: "Master general ledger accounts structure",
      category: "Accounts",
    },
    {
      title: "Profit & Loss & Reports",
      tab: "reports",
      icon: BarChart3,
      desc: "Financial statements & trial balance",
      category: "Reports",
    },
    {
      title: "Roles & Permissions (RBAC)",
      tab: "rbac",
      icon: ShieldCheck,
      desc: "Staff access-control security matrix",
      category: "Admin",
    },
  ];

  const handleSelect = (tab) => {
    setActiveTab(tab);
    setIsCommandOpen(false);
    setSearchQuery("");
  };

  const filteredLinks = quickLinks.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.desc.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md min-w-0">
          <button
            onClick={handleToggleMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setIsCommandOpen(true)}
            className="w-full flex items-center bg-slate-100/70 hover:bg-slate-100 border border-slate-200/80 rounded-xl px-3 py-1.5 sm:py-2 cursor-pointer transition-all group min-w-0"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 group-hover:text-blue-600 transition-colors" />
            <span className="text-xs text-slate-400 font-medium truncate flex-1">
              Quick search or command palette...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-500 rounded-md px-1.5 py-0.5 text-[10px] font-mono shadow-2xs font-semibold shrink-0 ml-1.5">
              <Command className="w-3 h-3" /> K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => setActiveTab("add-candidate")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-102 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Quick Enroll
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          <button className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 shrink-0">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          <div className="text-right hidden md:block">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user?.name || "Loading..."}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[10px] text-rose-500 font-medium hover:underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {isCommandOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-14 sm:pt-20 p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 shrink-0">
              <Search className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type command or module name..."
                className="w-full text-xs sm:text-sm font-medium text-slate-800 focus:outline-none bg-transparent placeholder:text-slate-400"
              />
              <button
                onClick={() => setIsCommandOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 overflow-y-auto divide-y divide-slate-50 flex-1">
              {filteredLinks.length > 0 ? (
                filteredLinks.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(item.tab)}
                      className="w-full text-left flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-blue-50/60 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-2xs shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors block truncate">
                            {item.title}
                          </span>
                          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No matching module found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
