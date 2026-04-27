import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "../components/layout/Topbar";
import UploadPortal from "../components/vault/UploadPortal";
import ApiErrorState from "../components/ui/ApiErrorState";
import { useAssets } from "../hooks/useAssets";
import { useAuth } from "../context/AuthContext";

const statusConfig = {
  Secure: {
    dot: "bg-green-500",
    badge: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  Scanning: {
    dot: "bg-amber-400 animate-pulse",
    badge: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  },
  Violated: {
    dot: "bg-red-500",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

const typeFilters = ["All", "video", "image"];
const statusFilters = ["All", "Secure", "Scanning", "Violated"];

export default function VaultPage() {
  const [showUpload, setShowUpload] = useState(false);
  const { assets, loading, error, refetch } = useAssets();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = assets.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || a.type === typeFilter;
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const statCounts = {
    total: assets.length,
    secure: assets.filter((a) => a.status === "Secure").length,
    scanning: assets.filter((a) => a.status === "Scanning").length,
    violated: assets.filter((a) => a.status === "Violated").length,
  };

  // ── Auth gate: show loading while Firebase resolves ────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-[Lexend,sans-serif] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          <p className="text-[14px] text-zinc-400">Loading PulseVerify…</p>
        </div>
      </div>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-[Lexend,sans-serif]">
        <Topbar />
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-6">
            <svg width="28" height="28" viewBox="0 0 16 16" fill="#ef4444">
              <path d="M8 1L2 3.8v3.7C2 11 4.8 13.6 8 14.2c3.2-.6 6-3.2 6-6.7V3.8L8 1z" />
            </svg>
          </div>
          <h2 className="text-[22px] font-bold text-white mb-2">Sign in to access your Vault</h2>
          <p className="text-[14px] text-zinc-500 max-w-md mb-8">
            Your asset library, violation tracking, and detection tools are behind a secure login.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-red-500 hover:bg-red-400 text-white text-[14px] font-semibold rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all"
          >
            Sign in to continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-[Lexend,sans-serif]">
      <Topbar onUploadClick={() => setShowUpload(true)} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="animate-fade-in-up flex items-end justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">
              Asset Vault
            </h1>
            <p className="text-[14px] text-zinc-500 mt-1">
              All registered and monitored media assets
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white text-[13px] font-semibold rounded-xl shadow-md shadow-red-500/20 active:scale-95 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Upload asset
          </button>
        </div>

        {/* Stat pills */}
        <div className="animate-fade-in-up stagger-1 grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total assets", value: statCounts.total, color: "text-white" },
            { label: "Secure", value: statCounts.secure, color: "text-green-400" },
            { label: "Scanning", value: statCounts.scanning, color: "text-amber-400" },
            { label: "Violated", value: statCounts.violated, color: "text-red-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="text-[11px] text-zinc-500 font-medium mb-1">{s.label}</div>
              <div className={`text-[28px] font-bold leading-none ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="animate-fade-in-up stagger-2 flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-[220px] relative">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets…"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {typeFilters.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all duration-150 ${
                  typeFilter === t
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t === "All" ? "All types" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all duration-150 ${
                  statusFilter === s
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {s === "All" ? "All status" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-4" />
            <p className="text-[14px] text-zinc-400">Loading your assets…</p>
          </div>
        )}

        {/* Error state — replaces generic toast with inline recovery UI */}
        {!loading && error && (
          <ApiErrorState
            error={error}
            onRetry={refetch}
            title="Couldn't load your assets"
          />
        )}

        {/* ── ZERO STATE: First-Run Experience ────────────────────────────── */}
        {/* When the user has no assets (excluding seed data), guide them */}
        {!loading && !error && assets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 flex items-center justify-center mb-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V8M8 12l4-4 4 4" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 16.5A4 4 0 0016 8h-.5A7 7 0 104 15.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-[22px] font-bold text-white mb-2">
              Your Vault is empty
            </h2>
            <p className="text-[14px] text-zinc-500 max-w-md mb-3 leading-relaxed">
              Upload your first official media asset — a match highlight, press photo, or brand clip.
              PulseVerify will automatically fingerprint it with pHash and analyze it with AI.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setShowUpload(true)}
                className="group flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-400 text-white text-[14px] font-semibold rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Upload your first asset
              </button>
            </div>

            {/* How it works mini-guide */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl w-full">
              {[
                { step: "1", title: "Upload", desc: "Drag & drop your official media" },
                { step: "2", title: "Auto-Analyze", desc: "pHash + AI run automatically" },
                { step: "3", title: "Monitor", desc: "We scan the web 24/7 for copies" },
              ].map((s) => (
                <div key={s.step} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                  <div className="text-[20px] font-bold text-red-500/40 mb-2">{s.step}</div>
                  <div className="text-[13px] font-semibold text-white mb-0.5">{s.title}</div>
                  <div className="text-[11px] text-zinc-500">{s.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Asset grid */}
        {!loading && !error && assets.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((a, i) => {
                const cfg = statusConfig[a.status] || statusConfig.Secure;
                return (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 250, damping: 25, delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50 transition-colors duration-300"
                  >
                  {/* Thumbnail */}
                  <div className="relative h-44 bg-zinc-800 overflow-hidden">
                    <img
                      src={a.thumbnail}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />

                    {/* Type badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white rounded-lg uppercase">
                        {a.type}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold backdrop-blur-sm ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {a.status}
                      </span>
                    </div>

                    {/* Violation overlay */}
                    {a.violations > 0 && (
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-1 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-400 text-[10px] font-bold rounded-lg">
                          {a.violations} violations
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-[14px] font-semibold text-white truncate mb-1">
                      {a.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {a.pulseId}
                      </span>
                      <span className="text-[11px] text-zinc-600">
                        {a.uploadedAt}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>
        )}

        {/* Filtered empty state (assets exist but filters don't match) */}
        {!loading && !error && assets.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#71717a" strokeWidth="1.5" />
                <path d="M16 16l4.5 4.5" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-zinc-400">No assets found</p>
            <p className="text-[12px] text-zinc-600 mt-1">Try adjusting your filters or upload a new asset</p>
          </div>
        )}
      </main>

      {showUpload && (
        <UploadPortal
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            refetch();
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}