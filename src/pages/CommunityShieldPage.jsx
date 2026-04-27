import { useState } from "react";
import { motion } from "framer-motion";
import Topbar from "../components/layout/Topbar";

/* ── Mock leaderboard data ─────────────────────────────────────── */
const leaderboardData = [
  { id: 1, name: "Arjun Mehta", username: "@arjun_shield", avatar: "AM", points: 4820, reports: 47, verified: 39, badge: "🏆", badgeLabel: "Piracy Hunter", streak: 14 },
  { id: 2, name: "Sarah Chen", username: "@s_chen99", avatar: "SC", points: 3950, reports: 38, verified: 31, badge: "🛡️", badgeLabel: "Stadium Guardian", streak: 9 },
  { id: 3, name: "Raj Patel", username: "@rajp_sports", avatar: "RP", points: 3210, reports: 33, verified: 27, badge: "🛡️", badgeLabel: "Stadium Guardian", streak: 7 },
  { id: 4, name: "Maria Santos", username: "@maria_br", avatar: "MS", points: 2780, reports: 29, verified: 22, badge: "⚡", badgeLabel: "First Responder", streak: 5 },
  { id: 5, name: "Jake Thompson", username: "@jake_t", avatar: "JT", points: 2340, reports: 25, verified: 19, badge: "⚡", badgeLabel: "First Responder", streak: 3 },
  { id: 6, name: "Priya Sharma", username: "@priya_dev", avatar: "PS", points: 1890, reports: 21, verified: 16, badge: "👁️", badgeLabel: "Sharp Eye", streak: 2 },
  { id: 7, name: "Omar Ali", username: "@omar_ali", avatar: "OA", points: 1450, reports: 18, verified: 12, badge: "👁️", badgeLabel: "Sharp Eye", streak: 1 },
  { id: 8, name: "Lisa Wang", username: "@lisawang", avatar: "LW", points: 1120, reports: 14, verified: 9, badge: "🌱", badgeLabel: "Rookie Scout", streak: 1 },
];

/* ── Badge tiers ───────────────────────────────────────────────── */
const badgeTiers = [
  { icon: "🏆", label: "Piracy Hunter", desc: "50+ verified reports", threshold: "50+ verified", color: "from-amber-500/20 to-amber-600/5 border-amber-500/30" },
  { icon: "🛡️", label: "Stadium Guardian", desc: "25+ verified reports", threshold: "25+ verified", color: "from-blue-500/20 to-blue-500/5 border-blue-500/30" },
  { icon: "⚡", label: "First Responder", desc: "10+ verified reports", threshold: "10+ verified", color: "from-purple-500/20 to-purple-500/5 border-purple-500/30" },
  { icon: "👁️", label: "Sharp Eye", desc: "5+ verified reports", threshold: "5+ verified", color: "from-green-500/20 to-green-500/5 border-green-500/30" },
  { icon: "🌱", label: "Rookie Scout", desc: "First verified report", threshold: "1+ verified", color: "from-zinc-500/20 to-zinc-500/5 border-zinc-500/30" },
];

/* ── Platform options for report form ──────────────────────────── */
const platforms = ["Telegram", "YouTube", "TikTok", "Instagram", "Facebook", "Twitter/X", "Reddit", "Other"];

/* ── Recent verified reports (activity feed) ───────────────────── */
const recentActivity = [
  { user: "Arjun Mehta", action: "reported a pirated stream on Telegram", time: "12 min ago", points: "+120", verified: true },
  { user: "Sarah Chen", action: "submitted a YouTube clip for review", time: "28 min ago", points: "+80", verified: true },
  { user: "Raj Patel", action: "flagged an Instagram repost", time: "1 hr ago", points: "+100", verified: true },
  { user: "Maria Santos", action: "reported a TikTok rip", time: "2 hr ago", points: "+90", verified: false },
  { user: "Jake Thompson", action: "found a Reddit reupload", time: "3 hr ago", points: "+110", verified: true },
];

export default function CommunityShieldPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const [reportPlatform, setReportPlatform] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("leaderboard");

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!reportUrl || !reportPlatform) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setReportUrl("");
      setReportPlatform("");
      setReportDesc("");
    }, 3000);
  };

  /* Your stats (mock current user) */
  const myStats = { rank: 12, points: 640, reports: 8, verified: 5, badge: "👁️", badgeLabel: "Sharp Eye" };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-[Lexend,sans-serif]">
      <Topbar onUploadClick={() => setShowUpload(true)} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="animate-fade-in-up mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[28px]">🛡️</span>
            <h1 className="text-[28px] font-bold tracking-tight">Community Shield</h1>
          </div>
          <p className="text-[14px] text-zinc-500">
            Help protect sports media. Report piracy, earn points, climb the leaderboard.
          </p>
        </div>

        {/* ── Your Stats Banner ───────────────────────────────── */}
        <div className="animate-fade-in-up stagger-1 bg-gradient-to-r from-red-500/10 via-zinc-900 to-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[18px] font-bold text-zinc-300">
                SR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-semibold text-white">Your Profile</h2>
                  <span className="text-[14px]">{myStats.badge}</span>
                  <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
                    {myStats.badgeLabel}
                  </span>
                </div>
                <p className="text-[12px] text-zinc-500 mt-0.5">Rank #{myStats.rank} · Keep reporting to climb!</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {[
                { label: "Points", value: myStats.points, color: "text-amber-400" },
                { label: "Reports", value: myStats.reports, color: "text-zinc-300" },
                { label: "Verified", value: myStats.verified, color: "text-green-400" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-[24px] font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-zinc-500 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── How it Works ────────────────────────────────────── */}
        <div className="animate-fade-in-up stagger-2 grid md:grid-cols-3 gap-4 mb-8">
          {[
            { step: "01", icon: "🔗", title: "Report a link", desc: "Spot pirated content? Submit the URL and platform." },
            { step: "02", icon: "🤖", title: "AI verifies", desc: "Our AI compares it against registered assets using Pulse ID fingerprinting." },
            { step: "03", icon: "⭐", title: "Earn rewards", desc: "Verified reports earn points, badges, and leaderboard rank." },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.12, type: "spring", stiffness: 120 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[20px]">{s.icon}</span>
                <span className="text-[32px] font-bold text-zinc-800 leading-none select-none">{s.step}</span>
              </div>
              <h3 className="text-[14px] font-semibold text-white mb-1">{s.title}</h3>
              <p className="text-[12px] text-zinc-500 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* ── Left: report form + activity feed (2 cols) ─── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Report Form */}
            <div className="animate-fade-in-up stagger-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-[16px] font-semibold text-white mb-1 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Report pirated content
              </h2>
              <p className="text-[12px] text-zinc-500 mb-5">Submit a link to unauthorized content and our AI will verify it.</p>

              {submitted ? (
                <div className="flex flex-col items-center py-8 text-center animate-scale-in">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-[16px] font-semibold text-white">Report submitted!</h3>
                  <p className="text-[12px] text-zinc-500 mt-1">Our AI is verifying. You'll earn points if confirmed.</p>
                  <div className="flex items-center gap-1 mt-3 text-amber-400">
                    <span className="text-[14px]">⭐</span>
                    <span className="text-[14px] font-bold">+80 - 120 points</span>
                    <span className="text-[12px] text-zinc-500 ml-1">pending verification</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">Piracy URL *</label>
                    <input
                      type="url"
                      value={reportUrl}
                      onChange={(e) => setReportUrl(e.target.value)}
                      placeholder="https://t.me/pirated_channel/1234"
                      required
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">Platform *</label>
                      <select
                        value={reportPlatform}
                        onChange={(e) => setReportPlatform(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-[13px] text-white focus:outline-none focus:border-red-500/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="text-zinc-600">Select platform</option>
                        {platforms.map((p) => (
                          <option key={p} value={p} className="bg-zinc-800">{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">Content type</label>
                      <select className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-[13px] text-white focus:outline-none focus:border-red-500/50 transition-all appearance-none cursor-pointer">
                        <option className="bg-zinc-800">Live stream</option>
                        <option className="bg-zinc-800">Video clip</option>
                        <option className="bg-zinc-800">Image / Thumbnail</option>
                        <option className="bg-zinc-800">Full match replay</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">Description (optional)</label>
                    <textarea
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder="Any extra details — channel name, viewer count, etc."
                      rows={3}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-red-500 hover:bg-red-400 text-white text-[14px] font-semibold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Submit report
                  </button>
                </form>
              )}
            </div>

            {/* Activity Feed */}
            <div className="animate-fade-in-up stagger-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-[14px] font-semibold text-white mb-3">Recent community activity</h3>
              <div className="flex flex-col gap-2">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-800/40 border border-zinc-700/30 hover:bg-zinc-800/60 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">
                      {a.user.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-zinc-300">
                        <span className="font-semibold text-white">{a.user}</span>{" "}
                        {a.action}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{a.time}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {a.verified && (
                        <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                      <span className="text-[12px] font-bold text-amber-400">{a.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right sidebar ─────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Tab switcher */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              {["leaderboard", "badges"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-[12px] font-medium rounded-lg transition-all ${
                    activeTab === tab ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab === "leaderboard" ? "🏅 Leaderboard" : "🎖️ Badges"}
                </button>
              ))}
            </div>

            {/* Leaderboard */}
            {activeTab === "leaderboard" && (
              <div className="animate-fade-in bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold text-white">Top Protectors</h3>
                  <span className="text-[11px] text-zinc-500">This week</span>
                </div>
                <div className="flex flex-col gap-2">
                  {leaderboardData.map((user, i) => {
                    const rankColors = ["text-amber-400", "text-zinc-300", "text-amber-700"];
                    const rankBgs = ["bg-amber-400/10", "bg-zinc-700/30", "bg-amber-700/10"];
                    return (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-800/30 border border-zinc-800 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all"
                      >
                        {/* Rank */}
                        <div className={`w-7 h-7 rounded-lg ${i < 3 ? rankBgs[i] : "bg-zinc-800"} flex items-center justify-center shrink-0`}>
                          <span className={`text-[12px] font-bold ${i < 3 ? rankColors[i] : "text-zinc-500"}`}>
                            {i + 1}
                          </span>
                        </div>

                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">
                          {user.avatar}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-medium text-white truncate">{user.name}</span>
                            <span className="text-[12px]">{user.badge}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500">{user.verified} verified · {user.streak}d streak</div>
                        </div>

                        {/* Points */}
                        <div className="shrink-0 text-right">
                          <div className="text-[13px] font-bold text-amber-400">{user.points.toLocaleString()}</div>
                          <div className="text-[9px] text-zinc-600">pts</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Badges */}
            {activeTab === "badges" && (
              <div className="animate-fade-in bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-[14px] font-semibold text-white mb-4">Badge tiers</h3>
                <div className="flex flex-col gap-3">
                  {badgeTiers.map((b) => (
                    <div
                      key={b.label}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${b.color} border transition-all hover:scale-[1.02]`}
                    >
                      <span className="text-[24px] shrink-0">{b.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-white">{b.label}</div>
                        <div className="text-[11px] text-zinc-400">{b.desc}</div>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">{b.threshold}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reward info */}
            <div className="animate-fade-in-up stagger-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-[14px] font-semibold text-white mb-3">Rewards</h3>
              <div className="flex flex-col gap-2">
                {[
                  { pts: "500", reward: "Official team stickers pack" },
                  { pts: "2,000", reward: "Signed merchandise" },
                  { pts: "5,000", reward: "Match day ticket discount" },
                  { pts: "10,000", reward: "VIP stadium experience" },
                ].map((r) => (
                  <div key={r.pts} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/40">
                    <span className="text-[12px] font-bold text-amber-400 w-12 shrink-0">{r.pts}</span>
                    <span className="text-[12px] text-zinc-400">{r.reward}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}