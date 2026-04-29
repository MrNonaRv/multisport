import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn, Trophy, Activity, Users, Calendar, LayoutGrid, ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useW, SPORTS, COLORS } from "./db";
import { LOGO, NAV, HAM } from "./components/Shared";
import Home from "./pages/Home";
import SportPage from "./pages/SportPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { DatabaseProvider } from "./context/DatabaseContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

function Layout({ children }: { children: React.ReactNode }) {
  const w = useW();
  const mob = w < 768;
  const [menu, setMenu] = useState(false);
  const [showSports, setShowSports] = useState(false);
  const loc = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSports(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ fontFamily: "'Exo 2','Segoe UI',sans-serif", minHeight: "100vh", background: "#020917", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Exo+2:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #020917; color: #e2e8f0; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .nav-link:hover { color: #38bdf8 !important; }
        .dropdown-item:hover { background: #1e3a5f !important; color: #38bdf8 !important; }
      `}</style>
      
      {loc.pathname.startsWith("/sport/") ? (
        children
      ) : (
        <>
          <nav style={{ ...NAV, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
            <Link to="/" style={{ ...LOGO, textDecoration: "none", gap: 12 }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2L4 8.22222V17.1111C4 25.1111 9.83333 32.3556 18 34C26.1667 32.3556 32 25.1111 32 17.1111V8.22222L18 2Z" fill="url(#paint0_linear)"/>
                <path d="M18 6.5L27 10.5V17.1111C27 23.2222 23.3333 28.6667 18 30C12.6667 28.6667 9 23.2222 9 17.1111V10.5L18 6.5Z" fill="#020917"/>
                <path d="M18 11L22.5 23H13.5L18 11Z" fill="url(#paint0_linear)"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38BDF8"/>
                    <stop offset="1" stopColor="#2563EB"/>
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: 1 }}>
                <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.05em", color: "#fff" }}>MULTI<span style={{ color: "#38bdf8" }}>SPORTS</span></span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>Tournament Hub</span>
              </div>
            </Link>
            {!mob ? (
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <Link to="/" className="nav-link" style={{ color: loc.pathname === "/" ? "#38bdf8" : "#94a3b8", textDecoration: "none", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, transition: "color 0.2s" }}>Dashboard</Link>
                
                <div style={{ position: "relative" }} ref={dropdownRef}>
                  <button 
                    onClick={() => setShowSports(!showSports)}
                    style={{ background: "transparent", border: "none", color: loc.pathname.startsWith("/sport/") ? "#38bdf8" : "#94a3b8", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s" }}
                  >
                    Sports <ChevronDown size={14} style={{ transform: showSports ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </button>
                  
                  {showSports && (
                    <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 12, background: "#0f2040", border: "1px solid #1e3a5f", borderRadius: 12, padding: "8px 0", minWidth: 200, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: 1000 }}>
                      {SPORTS.map(s => (
                        <Link 
                          key={s} 
                          to={`/sport/${s.toLowerCase().split(" ").join("-")}`}
                          className="dropdown-item"
                          onClick={() => setShowSports(false)}
                          style={{ display: "block", padding: "10px 20px", color: "#e2e8f0", textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}
                        >
                          {s}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {user ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Link to="/dashboard" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>Admin Panel</Link>
                    <button onClick={logout} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontWeight: 800, fontSize: 11, textTransform: "uppercase" }}>Logout</button>
                  </div>
                ) : (
                  <Link to="/login" style={{ textDecoration: "none" }}>
                    <button style={{ background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 24, cursor: "pointer", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(56,189,248,0.3)" }}>
                      <LogIn size={16} /> Staff Login
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <button style={HAM} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
            )}
          </nav>

          {mob && (
            <>
              {/* Backdrop */}
              <div 
                onClick={() => setMenu(false)}
                style={{
                  position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
                  background: "rgba(0,0,0,0.5)", zIndex: 98, 
                  opacity: menu ? 1 : 0, pointerEvents: menu ? "auto" : "none", 
                  transition: "opacity 0.3s"
                }} 
              />
              {/* Sidebar */}
              <div style={{ 
                position: "fixed", top: 0, right: 0, bottom: 0, width: "80%", maxWidth: 300, 
                background: "#020917", zIndex: 99, padding: "80px 24px 24px", 
                display: "flex", flexDirection: "column", gap: 20, overflowY: "auto",
                transform: menu ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.3s ease-in-out",
                boxShadow: "-4px 0 20px rgba(0,0,0,0.5)"
              }}>
                <button style={{ ...HAM, position: "absolute", top: 16, right: 20 }} onClick={() => setMenu(false)}><X /></button>
                <Link to="/" onClick={() => setMenu(false)} style={{ color: loc.pathname === "/" ? "#38bdf8" : "#fff", textDecoration: "none", fontSize: 20, fontWeight: 800 }}>Dashboard</Link>
                <div style={{ borderTop: "1px solid #1e3a5f", paddingTop: 20 }}>
                  <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Sports</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                    {SPORTS.map(s => (
                      <Link 
                        key={s} 
                        to={`/sport/${s.toLowerCase().split(" ").join("-")}`} 
                        onClick={() => setMenu(false)} 
                        style={{ color: loc.pathname.includes(s.toLowerCase().split(" ").join("-")) ? "#38bdf8" : "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "12px", background: "#0f2040", borderRadius: 8 }}
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                </div>
                {user ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" }}>
                    <Link to="/dashboard" onClick={() => setMenu(false)} style={{ background: "#38bdf8", color: "#fff", padding: "16px", borderRadius: 12, textDecoration: "none", textAlign: "center", fontWeight: 800 }}>Admin Panel</Link>
                    <button onClick={() => { logout(); setMenu(false); }} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", padding: "16px", borderRadius: 12, cursor: "pointer", fontWeight: 800 }}>Logout</button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setMenu(false)} style={{ textDecoration: "none", marginTop: "auto" }}>
                    <button style={{ width: "100%", background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)", color: "#fff", border: "none", padding: "16px", borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 16 }}>
                      Staff Login
                    </button>
                  </Link>
                )}
              </div>
            </>
          )}

          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sport/:sportName" element={<SportPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </DatabaseProvider>
  );
}
