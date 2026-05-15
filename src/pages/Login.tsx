import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import { card, PP } from "../components/Shared";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, pass)) {
      navigate("/dashboard");
    } else {
      setErr("Invalid email or password. Please try again.");
    }
  };

  return (
    <div style={{ ...PP, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 100px)" }}>
      <div style={{ ...card, width: "100%", maxWidth: 400, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ margin: "0 auto 24px", display: "flex", justifyContent: "center" }}>
            <svg width="80" height="80" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2L4 8.22222V17.1111C4 25.1111 9.83333 32.3556 18 34C26.1667 32.3556 32 25.1111 32 17.1111V8.22222L18 2Z" fill="url(#paint0_linear_login)"/>
              <path d="M18 6.5L27 10.5V17.1111C27 23.2222 23.3333 28.6667 18 30C12.6667 28.6667 9 23.2222 9 17.1111V10.5L18 6.5Z" fill="var(--panel-bg)"/>
              <path d="M18 11L22.5 23H13.5L18 11Z" fill="url(#paint0_linear_login)"/>
              <defs>
                <linearGradient id="paint0_linear_login" x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38BDF8"/>
                  <stop offset="1" stopColor="#2563EB"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 }}>MULTI<span style={{ color: "#38bdf8" }}>SPORTS</span></h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>Staff Login</p>
        </div>

        {err && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10, color: "#ef4444", fontSize: 13, marginBottom: 24 }}>
            <AlertCircle size={18} /> {err}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="staff@multisports.com"
                required
                style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "12px 12px 12px 40px", color: "var(--text-main)", fontSize: 14, outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
              <input 
                type="password" 
                value={pass} 
                onChange={e => setPass(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "12px 12px 12px 40px", color: "var(--text-main)", fontSize: 14, outline: "none" }}
              />
            </div>
          </div>

          <button type="submit" style={{ background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)", color: "#ffffff", border: "none", padding: "14px", borderRadius: 12, fontWeight: 900, cursor: "pointer", fontSize: 14, textTransform: "uppercase", letterSpacing: 1, marginTop: 10, boxShadow: "0 10px 20px rgba(56,189,248,0.2)" }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
