import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "../components/layout/Topbar";
import ApiErrorState from "../components/ui/ApiErrorState";
import { useViolations } from "../hooks/useViolations";

const levelConfig = {
  Critical: {
    dot: "bg-red-500",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    text: "text-red-400",
    bar: "bg-red-500",
    label: "High Risk",
  },
  Medium: {
    dot: "bg-amber-400",
    badge: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    text: "text-amber-400",
    bar: "bg-amber-400",
    label: "Medium Risk",
  },
  Low: {
    dot: "bg-blue-400",
    badge: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    text: "text-blue-400",
    bar: "bg-blue-400",
    label: "Low Risk",
  },
};

const statusConfig = {
  open: { label: "Open", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  takedown_sent: { label: "Takedown sent", color: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
  resolved: { label: "Resolved", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  dismissed: { label: "Dismissed", color: "bg-zinc-700/50 text-zinc-400 border-zinc-600" },
};

const filterOptions = ["All", "open", "takedown_sent", "resolved"];

/**
 * SimilarityGauge — Visual similarity meter that a non-technical
 * sports manager can understand instantly.
 */
function SimilarityGauge({ value, level }) {
  const cfg = levelConfig[level] || levelConfig.Medium;
  const radius = 45;
  const circumference = Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-16">
        <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
          <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="#27272a" strokeWidth="7" strokeLinecap="round" />
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke={cfg.bar === 'bg-red-500' ? '#ef4444' : cfg.bar === 'bg-amber-400' ? '#fbbf24' : '#60a5fa'}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end">
          <span className="text-[24px] font-bold text-white">
            {value}<span className="text-[12px] text-zinc-500">%</span>
          </span>
        </div>
      </div>
      <div className={`text-[11px] font-semibold mt-1 ${cfg.text}`}>
        {value >= 95 ? "Nearly Identical" : value >= 85 ? "Very Similar" : value >= 70 ? "Similar" : "Partial Match"}
      </div>
    </div>
  );
}

export default function EvidenceBoardPage() {
  const { violations: cases, loading, error, refetch } = useViolations();
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("All");
  const [showUpload, setShowUpload] = useState(false);

  const filtered = filter === "All" ? cases : cases.filter((c) => c.status === filter);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-[Lexend,sans-serif]">
      <Topbar onUploadClick={() => setShowUpload(true)} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="animate-fade-in-up flex items-end justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">
              Evidence Board
            </h1>
            <p className="text-[14px] text-zinc-500 mt-1">
              Review and act on detected content violations
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-semibold rounded-lg">
              {cases.filter((c) => c.status === "open").length} open
            </span>
            <span className="px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[12px] font-semibold rounded-lg">
              {cases.filter((c) => c.status === "takedown_sent").length} pending
            </span>
            <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[12px] font-semibold rounded-lg">
              {cases.filter((c) => c.status === "resolved").length} resolved
            </span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="animate-fade-in-up stagger-1 flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit mb-6">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[12px] font-medium rounded-lg transition-all duration-150 ${
                filter === f
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f === "All"
                ? "All cases"
                : f === "takedown_sent"
                ? "Takedown sent"
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-4" />
            <p className="text-[14px] text-zinc-400">Loading evidence…</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <ApiErrorState error={error} onRetry={refetch} title="Couldn't load evidence data" />
        )}

        {/* Evidence cards */}
        {!loading && !error && (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((c, i) => {
                const cfg = levelConfig[c.level] || levelConfig.Medium;
                const sCfg = statusConfig[c.status] || statusConfig.open;
                const isExpanded = expanded === c.id;

                return (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28, delay: i * 0.06 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors duration-300"
                  >
                  {/* Main row */}
                  <div
                    className="flex items-center gap-5 p-5 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : c.id)}
                  >
                    {/* Side-by-side thumbnails */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
                        <img
                          src={c.originalThumb}
                          alt="Original"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 8H12M10 5l3 3-3 3" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 border border-red-500/30">
                        <img
                          src={c.detectedThumb}
                          alt="Detected"
                          className="w-full h-full object-cover opacity-80"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[14px] font-semibold text-white truncate">
                          {c.detectedTitle}
                        </h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sCfg.color}`}>
                          {sCfg.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-zinc-500">
                        Original: {c.originalTitle} · <span className="font-mono text-zinc-600">{c.pulseId}</span>
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {c.platform} · {c.detectedAt}
                      </p>
                    </div>

                    {/* Similarity gauge */}
                    <div className="shrink-0 w-28">
                      <SimilarityGauge value={c.similarity} level={c.level} />
                    </div>

                    {/* Severity badge */}
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${cfg.badge} shrink-0`}>
                      {c.level}
                    </span>

                    {/* Chevron */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={`text-zinc-500 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Expandable detail — Rich Evidence Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-zinc-800 px-5 py-5 bg-zinc-900/50">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* AI Report */}
                        <div className="md:col-span-2">
                          <h4 className="text-[13px] font-semibold text-white mb-3 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2a7 7 0 017 7v1a7 7 0 01-14 0V9a7 7 0 017-7z" stroke="#ef4444" strokeWidth="1.5" />
                              <circle cx="12" cy="10" r="2" fill="#ef4444" />
                            </svg>
                            AI Analysis Report
                          </h4>

                          {/* Key stats grid */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-zinc-800/50 rounded-xl p-3">
                              <div className="text-[10px] text-zinc-500 font-medium mb-1">AI Confidence</div>
                              <div className="text-[20px] font-bold text-white">{c.aiConfidence}%</div>
                            </div>
                            <div className="bg-zinc-800/50 rounded-xl p-3">
                              <div className="text-[10px] text-zinc-500 font-medium mb-1">Detection Method</div>
                              <div className="text-[12px] text-zinc-300 font-medium">{c.detectedVia}</div>
                            </div>
                            <div className="bg-zinc-800/50 rounded-xl p-3">
                              <div className="text-[10px] text-zinc-500 font-medium mb-1">Est. Reach</div>
                              <div className="text-[14px] text-red-400 font-bold">{c.estimatedReach}</div>
                            </div>
                          </div>

                          {/* AI Context — the detailed explanation */}
                          <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 mb-4">
                            <div className="text-[11px] text-zinc-500 font-medium mb-2">AI Analysis Summary</div>
                            <p className="text-[13px] text-zinc-300 leading-relaxed">{c.aiContext}</p>
                          </div>

                          {/* Detected modifications */}
                          <h5 className="text-[12px] font-medium text-zinc-400 mb-2">
                            Detected Modifications
                          </h5>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {c.modifications.map((mod, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-[11px] text-zinc-400"
                              >
                                {mod}
                              </span>
                            ))}
                          </div>

                          {/* Matched logos */}
                          {c.matchedLogos && c.matchedLogos.length > 0 && (
                            <>
                              <h5 className="text-[12px] font-medium text-zinc-400 mb-2">
                                Matched Logos & Branding
                              </h5>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {c.matchedLogos.map((logo, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2.5 py-1 bg-red-500/5 border border-red-500/20 rounded-lg text-[11px] text-red-400 flex items-center gap-1.5"
                                  >
                                    <svg width="10" height="10" viewBox="0 0 16 16" fill="#ef4444">
                                      <path d="M8 1L2 3.8v3.7C2 11 4.8 13.6 8 14.2c3.2-.6 6-3.2 6-6.7V3.8L8 1z" />
                                    </svg>
                                    {logo}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}

                          {/* Source + Uploader info */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-zinc-800/50 rounded-xl p-3">
                              <div className="text-[10px] text-zinc-500 font-medium mb-1">Source URL</div>
                              <div className="text-[12px] text-red-400 font-mono truncate">{c.sourceUrl}</div>
                            </div>
                            <div className="bg-zinc-800/50 rounded-xl p-3">
                              <div className="text-[10px] text-zinc-500 font-medium mb-1">Uploader Profile</div>
                              <div className="text-[12px] text-zinc-300 truncate">{c.uploaderProfile}</div>
                            </div>
                          </div>
                        </div>

                        {/* Quick actions */}
                        <div>
                          <h4 className="text-[13px] font-semibold text-white mb-3">
                            Quick Actions
                          </h4>
                          <div className="flex flex-col gap-2">
                            {c.status === "open" && (
                              <>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full py-2.5 bg-red-500 hover:bg-red-400 text-white text-[13px] font-semibold rounded-xl shadow-md shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                  </svg>
                                  Send takedown notice
                                </button>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[13px] font-medium rounded-xl transition-all"
                                >
                                  Dismiss case
                                </button>
                              </>
                            )}
                            {c.status === "takedown_sent" && (
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="w-full py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-[13px] font-semibold rounded-xl transition-all"
                              >
                                Mark as resolved
                              </button>
                            )}
                            {c.status === "resolved" && (
                              <div className="flex items-center gap-2 px-4 py-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-[12px] text-green-400 font-medium">
                                  This case has been resolved
                                </span>
                              </div>
                            )}
                            {c.status === "dismissed" && (
                              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl">
                                <span className="text-[12px] text-zinc-500 font-medium">
                                  Case dismissed
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Evidence strength indicator */}
                          <div className="mt-4 bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
                            <div className="text-[11px] text-zinc-500 font-medium mb-3">Evidence Strength</div>
                            {[
                              { label: "Visual match", score: c.similarity },
                              { label: "Logo detection", score: c.matchedLogos?.length > 0 ? 92 : 30 },
                              { label: "AI confidence", score: c.aiConfidence },
                            ].map((item) => (
                              <div key={item.label} className="mb-2 last:mb-0">
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                  <span className="text-zinc-400">{item.label}</span>
                                  <span className="text-white font-medium">{item.score}%</span>
                                </div>
                                <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                      item.score >= 90 ? 'bg-red-500' : item.score >= 70 ? 'bg-amber-400' : 'bg-blue-400'
                                    }`}
                                    style={{ width: `${item.score}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#22c55e" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-zinc-400">No cases match this filter</p>
            <p className="text-[12px] text-zinc-600 mt-1">Try switching to "All cases"</p>
          </div>
        )}
      </main>
    </div>
  );
}
