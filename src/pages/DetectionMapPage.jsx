import { useState, useMemo, useRef} from "react";
import Topbar from "../components/layout/Topbar";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

/* ── World topo json (public CDN) ─────────────────────────────── */
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

import { useViolations } from "../hooks/useViolations";

/* ── Color config ──────────────────────────────────────────────── */
const levelColors = {
  Critical: { fill: "#ef4444", text: "text-red-400", badge: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-500" },
  Medium: { fill: "#fbbf24", text: "text-amber-400", badge: "bg-amber-400/10 text-amber-400 border-amber-400/20", dot: "bg-amber-400" },
  Low: { fill: "#60a5fa", text: "text-blue-400", badge: "bg-blue-400/10 text-blue-400 border-blue-400/20", dot: "bg-blue-400" },
};

/* ── Recharts: violations over 7 days ──────────────────────────── */
const timeSeriesData = [
  { day: "Mon", violations: 12 },
  { day: "Tue", violations: 19 },
  { day: "Wed", violations: 28 },
  { day: "Thu", violations: 22 },
  { day: "Fri", violations: 35 },
  { day: "Sat", violations: 41 },
  { day: "Sun", violations: 38 },
];

/* ── Recharts: by platform ─────────────────────────────────────── */
const platformData = [
  { name: "Telegram", count: 38, fill: "#38bdf8" },
  { name: "YouTube", count: 31, fill: "#ef4444" },
  { name: "TikTok", count: 24, fill: "#a78bfa" },
  { name: "Instagram", count: 19, fill: "#f472b6" },
  { name: "Facebook", count: 14, fill: "#60a5fa" },
  { name: "Reddit", count: 9, fill: "#fb923c" },
  { name: "Twitter/X", count: 7, fill: "#a1a1aa" },
];

/* ── Recharts: by region (pie) ─────────────────────────────────── */
const regionData = [
  { name: "South Asia", value: 42, fill: "#ef4444" },
  { name: "SE Asia", value: 22, fill: "#fbbf24" },
  { name: "Europe", value: 18, fill: "#60a5fa" },
  { name: "N. America", value: 10, fill: "#a78bfa" },
  { name: "S. America", value: 5, fill: "#34d399" },
  { name: "Africa", value: 3, fill: "#fb923c" },
];

/* ── Analysis gauge params ─────────────────────────────────────── */
const analysisParams = [
  { label: "Visual Match", value: 98, stroke: "#ef4444" },
  { label: "Audio Fingerprint", value: 85, stroke: "#f59e0b" },
  { label: "Watermark Detect", value: 100, stroke: "#ef4444" },
  { label: "Framerate Sync", value: 72, stroke: "#60a5fa" },
];

/* ── Custom dark tooltip for recharts ──────────────────────────── */
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl text-[12px]">
      <p className="text-zinc-400 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white font-semibold">
          {p.name || p.dataKey}: {p.value}
        </p>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════ */
export default function DetectionMapPage() {
  const [selected, setSelected] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const mapRef = useRef(null);
  const { violations: detections, loading, error } = useViolations();

  /* region-count map (for heatmap coloring) */
  const countryViolations = useMemo(() => {
    const map = {};
    if (detections) {
      detections.forEach((d) => {
        map[d.country] = (map[d.country] || 0) + 1;
      });
    }
    return map;
  }, [detections]);

  /* get heatmap fill for a country */
  const getCountryFill = (geo) => {
    const name = geo.properties.name;
    const count = countryViolations[name] || 0;
    if (count === 0) return "#18181b"; // zinc-900
    if (count === 1) return "#7f1d1d"; // dark red
    if (count === 2) return "#991b1b";
    return "#dc2626"; // bright red for 3+
  };

  /* Business insight */
  const topRegion = regionData.reduce((a, b) => (a.value > b.value ? a : b));

  const toggleFullscreen = () => {
    if (!mapRef.current) return;

    if (!document.fullscreenElement) {
      mapRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-[Lexend,sans-serif]">
      <Topbar onUploadClick={() => setShowUpload(true)} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="animate-fade-in-up mb-8">
          <h1 className="text-[28px] font-bold tracking-tight">
            Global Threat Map
          </h1>
          <p className="text-[14px] text-zinc-500 mt-1">
            Heatmap of piracy activity — identify hotspots for broadcast rights enforcement
          </p>
        </div>

        {/* ── Video Comparison (kept from your version) ────────── */}
        <div className="grid md:grid-cols-2 gap-6 mb-6 animate-fade-in-up">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Original Source
              </h3>
              <span className="text-[12px] text-zinc-500 font-mono">Master Feed</span>
            </div>
            <div className="flex-1 aspect-video bg-black rounded-xl border border-zinc-800 relative flex items-center justify-center overflow-hidden">
              <span className="text-zinc-600 font-medium">Original Stream</span>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Detected Piracy
              </h3>
              <span className="text-[12px] text-red-400/80 font-mono">ID: {selected ? selected.id : "Auto-scan"}</span>
            </div>
            <div className="flex-1 aspect-video bg-black rounded-xl border border-red-500/20 relative flex items-center justify-center overflow-hidden">
              <span className="text-zinc-600 font-medium">Pirated Stream</span>
            </div>
          </div>
        </div>

        {/* ── Gauges ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8 animate-fade-in-up stagger-1">
          {analysisParams.map((param, i) => {
            const radius = 40;
            const circumference = Math.PI * radius;
            const offset = circumference - (param.value / 100) * circumference;
            return (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center justify-center">
                <h4 className="text-[12px] font-medium text-zinc-400 mb-4">{param.label}</h4>
                <div className="relative w-28 h-14">
                  <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#27272a" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={param.stroke} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end pb-1">
                    <span className="text-[22px] font-bold text-white">
                      {param.value}<span className="text-[12px] text-zinc-500">%</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── WORLD MAP + SIDEBAR ──────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5 mb-8">
          {/* Map — 2 cols */}
          <div className="lg:col-span-2 animate-fade-in-up stagger-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden relative">
              {/* Map header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-[15px] font-semibold text-white">Global Heatmap of Piracy</h2>
                  <p className="text-[12px] text-zinc-500 mt-0.5">Countries colored by violation density</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[24px] font-bold text-white">{detections.length}</span>
                  <span className="text-[11px] text-zinc-500">active<br />detections</span>
                </div>
              </div>

              {/* react-simple-maps world */}
              <div className="relative">
                <div ref={mapRef} style={{ position: "relative", width: "100%" }}>
  <ComposableMap
    projection="geoNaturalEarth1"
    projectionConfig={{ scale: 160 }}
    style={{ width: "100%", height: "auto" }}
    width={800}
    height={400}
  >
    <ZoomableGroup center={[40, 15]} zoom={1}>
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={getCountryFill(geo)}
              stroke="#27272a"
              strokeWidth={0.4}
              style={{
                default: { outline: "none" },
                hover: { outline: "none", fill: "#3f3f46", cursor: "pointer" },
                pressed: { outline: "none" },
              }}
            />
          ))
        }
      </Geographies>

      {detections.map((d) => {
        const cfg = levelColors[d.level];
        return (
          <Marker
            key={d.id}
            coordinates={d.coords}
            onClick={() => setSelected(d)}
            onMouseEnter={() => setHoveredMarker(d)}
            onMouseLeave={() => setHoveredMarker(null)}
          >
            <circle r={6} fill={cfg.fill} opacity={0.2}>
              <animate attributeName="r" values="4;10;4" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2.5s" repeatCount="indefinite" />
            </circle>

            <circle
              r={3.5}
              fill={cfg.fill}
              stroke="#09090b"
              strokeWidth={1}
              className="cursor-pointer"
            />
          </Marker>
        );
      })}
    </ZoomableGroup>
  </ComposableMap>

  {/* ✅ Bottom-right icon */}
  <div
    onClick={toggleFullscreen}
    style={{
      position: "absolute",
      bottom: "10px",
      right: "10px",
      opacity: 0.6,
      cursor: "pointer"
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="white"
    >
      <path d="M8 3V5H4V9H2V3H8ZM2 21V15H4V19H8V21H2ZM22 21H16V19H20V15H22V21ZM22 9H20V5H16V3H22V9Z"></path>
    </svg>
  </div>
</div>

                {/* Hover tooltip — shows WHY this location is a hotspot */}
                {hoveredMarker && (
                  <div className="absolute top-4 left-4 bg-zinc-800/95 backdrop-blur-sm border border-zinc-700 rounded-xl px-4 py-3 shadow-2xl pointer-events-none z-20 animate-fade-in max-w-xs">
                    <p className="text-[13px] font-semibold text-white">{hoveredMarker.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {hoveredMarker.city}, {hoveredMarker.country} · {hoveredMarker.platform}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[13px] font-bold ${levelColors[hoveredMarker.level]?.text || 'text-zinc-300'}`}>
                        {hoveredMarker.similarity}% match
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${levelColors[hoveredMarker.level]?.badge || ''}`}>
                        {hoveredMarker.level}
                      </span>
                    </div>
                    {hoveredMarker.estimatedReach && hoveredMarker.estimatedReach !== 'Unknown' && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500">Reach:</span>
                        <span className="text-[11px] text-red-400 font-semibold">{hoveredMarker.estimatedReach}</span>
                      </div>
                    )}
                    <p className="text-[10px] text-zinc-500 mt-1">Click for full intelligence →</p>
                  </div>
                )}
              </div>

              {/* Legend + heatmap scale */}
              <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {["Critical", "Medium", "Low"].map((level) => (
                    <div key={level} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${levelColors[level].dot}`} />
                      <span className="text-[10px] text-zinc-400 font-medium">{level}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500">Density:</span>
                  <div className="flex h-2 rounded-full overflow-hidden">
                    <div className="w-6 bg-zinc-800" title="Low" />
                    <div className="w-6 bg-red-900" title="Medium" />
                    <div className="w-6 bg-red-700" title="High" />
                    <div className="w-6 bg-red-500 rounded-r-full" title="Critical" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar — detection feed ─────────────────────────── */}
          <div className="animate-fade-in-up stagger-3 flex flex-col gap-4">
            {/* Business insight callout */}
            <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[12px] font-semibold text-red-400">Rights Insight</span>
              </div>
              <p className="text-[13px] text-zinc-300 leading-relaxed">
                <span className="font-semibold text-white">{topRegion.name}</span> accounts for{" "}
                <span className="font-bold text-red-400">{topRegion.value}%</span> of all piracy activity.
                Consider strengthening broadcast licensing in this region.
              </p>
            </div>

            {/* Detection feed */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex-1">
              <h3 className="text-[14px] font-semibold text-white mb-3">Recent detections</h3>
              <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
                {detections.map((d) => {
                  const cfg = levelColors[d.level];
                  const isSelected = selected?.id === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelected(d)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${isSelected
                          ? "bg-zinc-800 border-zinc-600"
                          : "bg-zinc-800/30 border-zinc-800 hover:bg-zinc-800/60 hover:border-zinc-700"
                        }`}
                    >
                      <div className={`w-7 h-7 rounded-lg ${d.level === "Critical" ? "bg-red-500/10" : d.level === "Medium" ? "bg-amber-400/10" : "bg-blue-400/10"} flex items-center justify-center shrink-0`}>
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-white truncate">{d.title}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{d.platform} · {d.country} · {d.time}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={`text-[12px] font-bold ${cfg.text}`}>{d.similarity}%</div>
                        <div className="text-[9px] text-zinc-600">match</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── RECHARTS ANALYTICS PANEL ─────────────────────────── */}
        <div className="animate-fade-in-up stagger-4 mb-8">
          <h2 className="text-[18px] font-semibold text-white mb-4">Piracy Analytics</h2>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* ── Area chart: violations over time ──────────────── */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[14px] font-semibold text-white">Violations over time</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Last 7 days</p>
                </div>
                <div className="text-right">
                  <span className="text-[20px] font-bold text-red-400">
                    {timeSeriesData.reduce((a, b) => a + b.violations, 0)}
                  </span>
                  <span className="text-[11px] text-zinc-500 ml-1">total</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                  <RechartsTooltip content={<DarkTooltip />} />
                  <Area type="monotone" dataKey="violations" stroke="#ef4444" strokeWidth={2} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* ── Pie chart: by region ──────────────────────────── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-[14px] font-semibold text-white mb-1">By region</h3>
              <p className="text-[11px] text-zinc-500 mb-4">Distribution of piracy hotspots</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {regionData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {regionData.map((r) => (
                  <div key={r.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.fill }} />
                    <span className="text-[10px] text-zinc-400">{r.name} <span className="text-zinc-600">{r.value}%</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bar chart: by platform ──────────────────────────── */}
          <div className="mt-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-semibold text-white">Violations by platform</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Where pirated content is hosted most</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={platformData} barSize={28}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <RechartsTooltip content={<DarkTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {platformData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Selected detection detail — Rich Hotspot Intelligence ── */}
        {selected && (
          <div className="animate-fade-in-up mb-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[18px] font-semibold text-white">{selected.title}</h3>
                <p className="text-[13px] text-zinc-500 mt-1">
                  Detected on {selected.platform} · {selected.city}, {selected.country} · {selected.time}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Key metrics */}
            <div className="grid md:grid-cols-5 gap-4 mt-5">
              {[
                { label: "Similarity", value: `${selected.similarity}%`, color: levelColors[selected.level]?.text || 'text-zinc-300' },
                { label: "Severity", value: selected.level, color: levelColors[selected.level]?.text || 'text-zinc-300' },
                { label: "Platform", value: selected.platform, color: "text-zinc-300" },
                { label: "Est. Reach", value: selected.estimatedReach || 'Unknown', color: "text-red-400" },
                { label: "Region", value: selected.region, color: "text-zinc-300" },
              ].map((item) => (
                <div key={item.label} className="bg-zinc-800/50 rounded-xl p-4">
                  <div className="text-[11px] text-zinc-500 font-medium mb-1">{item.label}</div>
                  <div className={`text-[16px] font-bold ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Why is this a hotspot — AI intelligence */}
            {selected.aiContext && (
              <div className="mt-4 bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2a7 7 0 017 7v1a7 7 0 01-14 0V9a7 7 0 017-7z" stroke="#ef4444" strokeWidth="1.5" />
                    <circle cx="12" cy="10" r="2" fill="#ef4444" />
                  </svg>
                  <span className="text-[12px] font-semibold text-red-400">Why is this a hotspot?</span>
                </div>
                <p className="text-[13px] text-zinc-300 leading-relaxed">{selected.aiContext}</p>
              </div>
            )}

            {/* Modifications + Matched Logos */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {selected.modifications && selected.modifications.length > 0 && (
                <div>
                  <div className="text-[11px] text-zinc-500 font-medium mb-2">Modifications Detected</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.modifications.map((mod, i) => (
                      <span key={i} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-lg text-[10px] text-zinc-400">{mod}</span>
                    ))}
                  </div>
                </div>
              )}
              {selected.matchedLogos && selected.matchedLogos.length > 0 && (
                <div>
                  <div className="text-[11px] text-zinc-500 font-medium mb-2">Matched Logos</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.matchedLogos.map((logo, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-500/5 border border-red-500/20 rounded-lg text-[10px] text-red-400">{logo}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Uploader info + Detection method */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-zinc-800/50 rounded-xl p-3">
                <div className="text-[10px] text-zinc-500 font-medium mb-1">Uploader Profile</div>
                <div className="text-[12px] text-zinc-300">{selected.uploaderProfile || 'Unknown'}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-3">
                <div className="text-[10px] text-zinc-500 font-medium mb-1">Detection Method</div>
                <div className="text-[12px] text-zinc-300">{selected.detectedVia || 'Automated scan'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5">
              <button className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-[13px] font-semibold rounded-xl shadow-md shadow-red-500/20 active:scale-95 transition-all">
                Send takedown
              </button>
              <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[13px] font-medium rounded-xl transition-all">
                View evidence
              </button>
              <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[13px] font-medium rounded-xl transition-all">
                Dismiss
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}