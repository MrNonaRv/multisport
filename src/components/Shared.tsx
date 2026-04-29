import React from "react";
export const cols = (w: number) => w < 600 ? 1 : w < 900 ? 2 : 3;
export const card = { background: "#0f2040", borderRadius: 12, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", border: "1px solid #1e3a5f" };
export const inp = { width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #1e3a5f", background: "#0a1628", color: "#fff", outline: "none", fontSize: 14 };
export const Btn = (bg: string, v: "solid" | "outline" = "solid") => ({
  background: v === "solid" ? bg : "transparent",
  color: v === "solid" ? "#fff" : bg,
  border: v === "solid" ? "none" : `1px solid ${bg}`,
  padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 700,
  transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
});
export const Badge = (bg: string) => ({ background: bg, color: "#fff", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.5 });
export const NBtn = (act: boolean, c: string) => ({
  background: act ? c : "transparent", color: act ? "#fff" : "#94a3b8", border: "none",
  padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s"
});
export const PP = { padding: "20px" };
export const LOGO = { fontSize: 24, fontWeight: 900, letterSpacing: -1, color: "#fff", display: "flex", alignItems: "center", gap: 8 };
export const NAV = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "#0f2040", borderBottom: "1px solid #1e3a5f", position: "sticky" as const, top: 0, zIndex: 100 };
export const HAM = { background: "transparent", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" };

export function MiniBar({ val, max, col }: { val: number, max: number, col: string }) {
  return (
    <div style={{ width: "100%", height: 6, background: "#1e3a5f", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, (val / max) * 100)}%`, height: "100%", background: col, borderRadius: 3 }} />
    </div>
  );
}

export function Donut({ pct, col, size = 60 }: { pct: number, col: string, size?: number }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e3a5f" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth="6" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <div style={{ position: "absolute", fontSize: size * 0.25, fontWeight: 800, color: "#fff" }}>{pct}%</div>
    </div>
  );
}

export function OrangeBG({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", color: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(249,115,22,0.3)", position: "relative", overflow: "hidden" }}>{children}</div>;
}

export function WhiteBG({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "#fff", color: "#0f2040", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", position: "relative", overflow: "hidden" }}>{children}</div>;
}
