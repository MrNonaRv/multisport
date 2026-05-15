import React from "react";
export const cols = (w: number) => w < 600 ? 1 : w < 900 ? 2 : 3;
export const card = { 
  background: "var(--panel-bg)", 
  borderRadius: 16, 
  padding: 24, 
  boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", 
  border: "1px solid var(--border-color)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
};
export const inp = { 
  width: "100%", 
  padding: "14px 18px", 
  borderRadius: 12, 
  border: "1px solid var(--border-color)", 
  background: "var(--bg)", 
  color: "var(--text-main)", 
  outline: "none", 
  fontSize: 14,
  transition: "all 0.2s"
};
export const Btn = (bg: string, v: "solid" | "outline" = "solid") => ({
  background: v === "solid" ? bg : "transparent",
  color: v === "solid" ? "var(--text-main)" : bg,
  border: v === "solid" ? "none" : `1px solid ${bg}`,
  padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 700,
  transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
});
export const Badge = (bg: string) => ({ background: bg, color: "var(--text-main)", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.5 });
export const NBtn = (act: boolean, c: string) => ({
  background: act ? c : "transparent", color: act ? "var(--text-main)" : "var(--text-muted)", border: "none",
  padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s"
});
export const PP = { padding: "20px" };
export const LOGO = { fontSize: 24, fontWeight: 900, letterSpacing: -1, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8 };
export const NAV = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  padding: "16px 32px", 
  background: "var(--nav-bg)", 
  borderBottom: "1px solid var(--border-color)", 
  position: "sticky" as const, 
  top: 0, 
  zIndex: 100,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
};
export const HAM = { background: "transparent", border: "none", color: "var(--text-main)", fontSize: 24, cursor: "pointer" };

export function MiniBar({ val, max, col }: { val: number, max: number, col: string }) {
  return (
    <div style={{ width: "100%", height: 6, background: "var(--border-color)", borderRadius: 3, overflow: "hidden" }}>
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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-color)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth="6" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <div style={{ position: "absolute", fontSize: size * 0.25, fontWeight: 800, color: "var(--text-main)" }}>{pct}%</div>
    </div>
  );
}

export function OrangeBG({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", color: "#ffffff", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(249,115,22,0.3)", position: "relative", overflow: "hidden" }}>{children}</div>;
}

export function WhiteBG({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "var(--text-main)", color: "var(--panel-bg)", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", position: "relative", overflow: "hidden" }}>{children}</div>;
}
