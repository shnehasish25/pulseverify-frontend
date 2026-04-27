
import React from "react";
import { assets } from "../../features/assets/assetData";

const statusConfig = {
  Secure: {
    dot: "bg-green-500",
    badge: "bg-green-500/10 text-green-400 border-green-500/20",
    ring: "",
  },
  Scanning: {
    dot: "bg-amber-400 animate-pulse",
    badge: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    ring: "",
  },
  Violated: {
    dot: "bg-red-500",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    ring: "ring-1 ring-red-500/20",
  },
};

const typeIcon = (type) =>
  type === "video" ? (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-zinc-400">
      <path d="M11 8L5 4.5v7L11 8z" />
      <rect x="1" y="1" width="14" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-zinc-400">
      <rect x="1" y="1" width="14" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5.5" cy="5.5" r="1.5" />
      <path d="M1 11l4-3 3 2.5 3-4 4 4.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );

export default function AssetGrid({ onAssetClick }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Registered assets</h2>
          <p className="text-[12px] text-zinc-500 mt-0.5">{assets.length} protected files</p>
        </div>
        <button className="text-[12px] text-red-400 hover:text-red-300 font-medium transition-colors">
          Open vault →
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {assets.map((a) => {
          const cfg = statusConfig[a.status];
          return (
            <button
              key={a.id}
              onClick={() => onAssetClick?.(a)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600 active:scale-[0.99] transition-all duration-150 ${cfg.ring}`}
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-700">
                <img src={a.thumbnail} alt={a.title} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {typeIcon(a.type)}
                  <span className="text-[12px] font-medium text-white truncate">{a.title}</span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">{a.pulseId}</div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 shrink-0">
                {a.violations > 0 && (
                  <span className="text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                    {a.violations} violations
                  </span>
                )}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                  {a.status}
                </span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
