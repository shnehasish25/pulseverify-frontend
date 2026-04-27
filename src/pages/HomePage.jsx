import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

/* ── Animated counter ──────────────────────────────────────────── */
function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let n = 0;
          const step = Math.max(1, Math.ceil(target / 50));
          const id = setInterval(() => {
            n += step;
            if (n >= target) {
              setVal(target);
              clearInterval(id);
            } else setVal(n);
          }, 25);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ── Shield logo SVG ───────────────────────────────────────────── */
const ShieldIcon = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
  >
    <path d="M8 1L2 3.8v3.7C2 11 4.8 13.6 8 14.2c3.2-.6 6-3.2 6-6.7V3.8L8 1z" />
  </svg>
);

/* ── Feature cards data ────────────────────────────────────────── */
const features = [
  {
    title: "AI-Powered Detection",
    desc: "Perceptual hashing + deep learning models scan millions of pages, social feeds, and video platforms to find unauthorized copies of your media.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2a7 7 0 017 7v1a7 7 0 01-14 0V9a7 7 0 017-7z"
          stroke="#ef4444"
          strokeWidth="1.5"
        />
        <path
          d="M9 22h6M12 18v4"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="10" r="2" fill="#ef4444" />
      </svg>
    ),
  },
  {
    title: "Pulse ID Fingerprinting",
    desc: "Every registered asset gets a unique cryptographic fingerprint — a Pulse ID — so we can identify it anywhere on the web, even after cropping or re-encoding.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="4"
          stroke="#ef4444"
          strokeWidth="1.5"
        />
        <path
          d="M8 12h8M12 8v8"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3" stroke="#ef4444" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    title: "Real-Time Monitoring",
    desc: "Continuous scanning across 50+ platforms with live violation feeds and instant email / webhook alerts when unauthorized use is detected.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M22 12h-4l-3 9L9 3l-3 9H2"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

/* ── How-it-works steps ────────────────────────────────────────── */
const steps = [
  {
    num: "01",
    title: "Upload your asset",
    desc: "Drag & drop your official media — video clips, match highlights, brand imagery.",
  },
  {
    num: "02",
    title: "Generate Pulse ID",
    desc: "Our engine creates a perceptual hash fingerprint that survives compression, cropping, and re-encoding.",
  },
  {
    num: "03",
    title: "Monitor & Enforce",
    desc: "We continuously scan the web and alert you the moment unauthorized copies surface.",
  },
];

/* ── Stats banner data ─────────────────────────────────────────── */
const stats = [
  { value: 12400, suffix: "+", label: "Assets protected" },
  { value: 3890, suffix: "+", label: "Violations caught" },
  { value: 54, suffix: "", label: "Platforms scanned" },
  { value: 99, suffix: "%", label: "Detection accuracy" },
];

/* ════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const displayName = user?.displayName || user?.email?.split("@")[0] || null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-[Lexend,sans-serif] overflow-x-hidden">
      {/* ── Topbar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 h-16 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/30">
            <ShieldIcon size={16} className="text-white" />
          </div>
          <span className="text-[16px] font-semibold tracking-tight">
            PulseVerify
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {["Features", "How it works", "Dashboard"].map((item) =>
            item === "Dashboard" ? (
              <Link
                key={item}
                to={isAuthenticated ? "/vault" : "/login"}
                className="px-3.5 py-1.5 text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-all duration-150"
              >
                {item}
              </Link>
            ) : (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="px-3.5 py-1.5 text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-all duration-150"
              >
                {item}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-[13px] text-zinc-400">
                Hi, <span className="text-white font-medium">{displayName}</span>
              </span>
              <Link
                to="/vault"
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-[13px] font-semibold rounded-lg shadow-md shadow-red-500/20 active:scale-95 transition-all duration-150"
              >
                Go to Vault
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-1.5 text-[13px] font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-[13px] font-semibold rounded-lg shadow-md shadow-red-500/20 active:scale-95 transition-all duration-150"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-32">
        {/* Background grid */}
        <div className="absolute inset-0 grid-bg pointer-events-none" />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[12px] font-medium text-zinc-400">
              Protecting sports media integrity
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, type: "spring", stiffness: 80 }}
            className="text-[48px] md:text-[60px] font-bold leading-[1.08] tracking-tight"
          >
            <span className="text-white">Stop piracy.</span>
            <br />
            <span className="text-white">Protect your content.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[17px] text-zinc-400 mt-6 max-w-xl mx-auto leading-relaxed"
          >
            PulseVerify identifies, tracks, and flags unauthorized use of
            official sports media across the internet — in near real-time.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex items-center justify-center gap-4 mt-10"
          >
            <Link
              to="/login"
              className="group px-7 py-3 bg-red-500 hover:bg-red-400 text-white text-[14px] font-semibold rounded-xl shadow-lg shadow-red-500/25 active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              Open Command Center
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                className="group-hover:translate-x-0.5 transition-transform"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            <a
              href="#features"
              className="px-7 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-[14px] font-semibold rounded-xl transition-all duration-200"
            >
              Learn more
            </a>
          </motion.div>
        </div>

        {/* Floating shield decoration */}
        <div className="absolute right-[10%] top-[30%] animate-float opacity-10">
          <ShieldIcon size={80} className="text-red-500" />
        </div>
        <div className="absolute left-[8%] bottom-[20%] animate-float stagger-3 opacity-[0.06]">
          <ShieldIcon size={50} className="text-red-500" />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="relative px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-[32px] font-bold tracking-tight text-white"
          >
            Built for sports organizations
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-[15px] text-zinc-500 mt-3 max-w-lg mx-auto"
          >
            End-to-end content protection — from upload to takedown.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.15, type: "spring", stiffness: 100 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 hover:bg-zinc-900/80 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-[17px] font-semibold text-white mb-2">
                {f.title}
              </h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="relative px-6 py-24 bg-zinc-900/30 border-y border-zinc-800/50"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold tracking-tight text-white">
              How it works
            </h2>
            <p className="text-[15px] text-zinc-500 mt-3">
              Three steps to bulletproof protection.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.2, type: "spring", stiffness: 80 }}
                className="relative flex flex-col items-start"
              >
                {/* Step number */}
                <div className="text-[52px] font-bold text-zinc-800 leading-none mb-4 select-none">
                  {s.num}
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  {s.desc}
                </p>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 right-0 translate-x-1/2 w-px h-0.5 bg-zinc-800">
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full">
                      <svg
                        width="80"
                        height="2"
                        className="text-zinc-700"
                      >
                        <line
                          x1="0"
                          y1="1"
                          x2="80"
                          y2="1"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats banner ──────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: i * 0.1, type: "spring", stiffness: 120 }}
              className="text-center py-6"
            >
              <div className="text-[40px] font-bold text-white tracking-tight">
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-[13px] text-zinc-500 mt-1 font-medium">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center bg-zinc-900 border border-zinc-800 rounded-3xl p-14 relative overflow-hidden">
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent pointer-events-none" />

          <h2 className="relative text-[28px] font-bold tracking-tight text-white mb-3">
            Ready to protect your media?
          </h2>
          <p className="relative text-[14px] text-zinc-500 mb-8 max-w-md mx-auto">
            Start monitoring in under 2 minutes. No credit card required.
          </p>
          <Link
            to="/login"
            className="relative inline-flex items-center gap-2 px-7 py-3 bg-red-500 hover:bg-red-400 text-white text-[14px] font-semibold rounded-xl shadow-lg shadow-red-500/25 active:scale-95 transition-all duration-200"
          >
            <ShieldIcon size={14} className="text-white" />
            Get started free
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/50 px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-red-500 rounded-md flex items-center justify-center">
              <ShieldIcon size={11} className="text-white" />
            </div>
            <span className="text-[13px] font-semibold text-zinc-400">
              PulseVerify
            </span>
          </div>

          <div className="flex items-center gap-6">
            {["Dashboard", "Vault", "Detection Map", "Evidence Board"].map(
              (item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase().replace(/ /g, "-")}`}
                  className="text-[12px] text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  {item}
                </Link>
              )
            )}
          </div>

          <p className="text-[11px] text-zinc-700">
            © 2026 PulseVerify · Hackathon Project
          </p>
        </div>
      </footer>
    </div>
  );
}
