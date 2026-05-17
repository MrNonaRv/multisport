import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, Trophy, Activity, Users, Calendar, LayoutGrid, ChevronDown, Bell, Sun, Moon } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useW, SPORTS, COLORS } from "./db";
import { LOGO, NAV, HAM } from "./components/Shared";
import Home from "./pages/Home";
import SportPage from "./pages/SportPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Archives from "./pages/Archives";
import { DatabaseProvider, useDatabase } from "./context/DatabaseContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BouncingBallsBackground } from "./components/BouncingBallsBackground";

function GameNotifications() {
  const { db } = useDatabase();
  const navigate = useNavigate();
  const [activeNotifications, setActiveNotifications] = useState<any[]>([]);
  const prevLiveMatches = useRef<string[]>([]);
  
  useEffect(() => {
    // Detect new live matches
    const currentLive = db.matches.filter(m => m.status === "live");
    const currentLiveIds = currentLive.map(m => m.match_id.toString());
    const prevIds = prevLiveMatches.current;
    
    const newLiveIds = currentLiveIds.filter(id => !prevIds.includes(id));
    
    if (newLiveIds.length > 0 && prevIds.length > 0) {
      newLiveIds.forEach(id => {
        const m = currentLive.find(match => match.match_id.toString() === id);
        if (m) {
          const t1 = db.teams.find(t => t.team_id === m.team1_id);
          const t2 = db.teams.find(t => t.team_id === m.team2_id);
          
          const notif = {
            id: Date.now() + Math.random(),
            title: `Game Starting: ${m.sport}`,
            body: `${t1?.team_name} vs ${t2?.team_name} is now LIVE!`,
            sport: m.sport,
            match_id: m.match_id
          };
          
          setActiveNotifications(prev => [notif, ...prev]);
          
          setTimeout(() => {
            setActiveNotifications(prev => prev.filter(n => n.id !== notif.id));
          }, 8000); // hide after 8s
        }
      });
    }
    
    prevLiveMatches.current = currentLiveIds;
  }, [db.matches, db.teams]);
  
  if (activeNotifications.length === 0) return null;
  
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 12 }}>
      {activeNotifications.map(notif => {
        const c = COLORS[notif.sport as keyof typeof COLORS] || "#38bdf8";
        return (
          <div 
            key={notif.id}
            onClick={() => {
              navigate(`/sport/${notif.sport.toLowerCase().split(" ").join("-")}?match=${notif.match_id}`);
            }}
            style={{ 
              background: "var(--panel-bg)", 
              border: `2px solid ${c}`, 
              borderRadius: 16, 
              padding: 20, 
              width: 320,
              boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 20px ${c}40`,
              cursor: "pointer",
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              backdropFilter: "blur(10px)",
              animation: "slideIn 0.3s ease-out forwards"
            }}
          >
            <div style={{ background: `${c}20`, padding: 12, borderRadius: 12, color: c }}>
              <Bell size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, color: c, fontSize: 14, marginBottom: 4 }}>{notif.title}</div>
              <div style={{ color: "var(--text-main)", fontSize: 14, fontWeight: 600 }}>{notif.body}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>Click to view Dashboard</div>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { db } = useDatabase();
  const w = useW();
  const mob = w < 768;
  const [menu, setMenu] = useState(false);
  const [showSports, setShowSports] = useState(false);
  const loc = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSports(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [isDark]);

  return (
    <div className={isDark ? "dark" : ""} style={{ fontFamily: "'Exo 2','Segoe UI',sans-serif", minHeight: "100vh", color: "var(--text-main)", position: "relative" }}>
      <BouncingBallsBackground />
      <div style={{ position: "relative", zIndex: 10 }}>
        <GameNotifications />
        <style>{`
        :root {
          --bg: #f3f4f6;
          --bg-rgb: 243, 244, 246;
          --panel-bg: #ffffff;
          --panel-bg-rgb: 255, 255, 255;
          --text-main: #1f2937;
          --text-muted: #6b7280;
          --border-color: #e5e7eb;
          --border-hover: rgba(56, 189, 248, 0.4);
          --nav-bg: #ffffff;
          --glow-color: rgba(56, 189, 248, 0.3);
        }
        .dark {
          --bg: #030712;
          --bg-rgb: 3, 7, 18;
          --panel-bg: #111827;
          --panel-bg-rgb: 17, 24, 39;
          --text-main: #f9fafb;
          --text-muted: #9ca3af;
          --border-color: #1f2937;
          --border-hover: rgba(56, 189, 248, 0.5);
          --nav-bg: #030712;
          --glow-color: rgba(56, 189, 248, 0.4);
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Exo+2:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: var(--bg); color: var(--text-main); transition: background 0.2s, color 0.2s; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .nav-link:hover { color: #38bdf8 !important; }
        .dropdown-item:hover { background: var(--border-color) !important; color: #38bdf8 !important; }
      `}</style>
      
      {loc.pathname.startsWith("/sport/") || loc.pathname === "/dashboard" ? (
        children
      ) : (
        <>
          <nav style={{ ...NAV, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
            <Link to="/" style={{ ...LOGO, textDecoration: "none", gap: 12 }}>
              <div style={{ 
                width: 52, 
                height: 52, 
                borderRadius: "50%", 
                background: "#ffffff", 
                border: "2px solid var(--border-color)", 
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                overflow: "hidden", 
                padding: 2 
              }}>
                <img src="/logo.png" alt="Web-Based Sports Metrics" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: 1 }}>
                <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "0", color: "#60a5fa" }}>WEB-BASED</span>
                <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.05em", color: "var(--text-main)" }}>SPORTS <span style={{ color: "#f97316" }}>METRICS</span></span>
              </div>
            </Link>
            {!mob ? (
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <Link to="/" className="nav-link" style={{ color: loc.pathname === "/" ? "#38bdf8" : "var(--text-muted)", textDecoration: "none", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, transition: "color 0.2s" }}>Dashboard</Link>
                <Link to="/archives" className="nav-link" style={{ color: loc.pathname === "/archives" ? "#38bdf8" : "var(--text-muted)", textDecoration: "none", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, transition: "color 0.2s" }}>Archives</Link>
                
                <div style={{ position: "relative" }} ref={dropdownRef}>
                  <button 
                    onClick={() => setShowSports(!showSports)}
                    style={{ background: "transparent", border: "none", color: loc.pathname.startsWith("/sport/") ? "#38bdf8" : "var(--text-muted)", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s" }}
                  >
                    Sports <ChevronDown size={14} style={{ transform: showSports ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </button>
                  
                  {showSports && (
                    <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 12, background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "8px 0", minWidth: 200, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: 1000 }}>
                      {db.sports?.map(s => (
                        <Link 
                          key={s} 
                          to={`/sport/${s.toLowerCase().split(" ").join("-")}`}
                          className="dropdown-item"
                          onClick={() => setShowSports(false)}
                          style={{ display: "block", padding: "10px 20px", color: "var(--text-main)", textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}
                        >
                          {s}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {user ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button onClick={() => setIsDark(!isDark)} style={{ background: "transparent", border: "none", color: "var(--text-main)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <Link to="/dashboard" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>Admin Panel</Link>
                    <button onClick={logout} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontWeight: 800, fontSize: 11, textTransform: "uppercase" }}>Logout</button>
                  </div>
                ) : !loc.pathname.startsWith("/sport/") ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button onClick={() => setIsDark(!isDark)} style={{ background: "transparent", border: "none", color: "var(--text-main)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <Link to="/login" style={{ textDecoration: "none" }}>
                      <button style={{ background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: 24, cursor: "pointer", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(56,189,248,0.3)" }}>
                        <LogIn size={16} /> Staff Login
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button onClick={() => setIsDark(!isDark)} style={{ background: "transparent", border: "none", color: "var(--text-main)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                  </div>
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
                background: "var(--bg)", zIndex: 99, padding: "80px 24px 24px", 
                display: "flex", flexDirection: "column", gap: 20, overflowY: "auto",
                transform: menu ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.3s ease-in-out",
                boxShadow: "-4px 0 20px rgba(0,0,0,0.5)"
              }}>
                <button style={{ ...HAM, position: "absolute", top: 16, right: 20 }} onClick={() => setMenu(false)}><X /></button>
                <Link to="/" onClick={() => setMenu(false)} style={{ color: loc.pathname === "/" ? "#38bdf8" : "var(--text-main)", textDecoration: "none", fontSize: 20, fontWeight: 800 }}>Dashboard</Link>
                <Link to="/archives" onClick={() => setMenu(false)} style={{ color: loc.pathname === "/archives" ? "#38bdf8" : "var(--text-main)", textDecoration: "none", fontSize: 20, fontWeight: 800 }}>Archives</Link>
                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 20 }}>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Sports</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                    {db.sports?.map(s => (
                      <Link 
                        key={s} 
                        to={`/sport/${s.toLowerCase().split(" ").join("-")}`} 
                        onClick={() => setMenu(false)} 
                        style={{ color: loc.pathname.includes(s.toLowerCase().split(" ").join("-")) ? "#38bdf8" : "var(--text-main)", textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "12px", background: "var(--panel-bg)", borderRadius: 8 }}
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                </div>
                {user ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" }}>
                    <Link to="/dashboard" onClick={() => setMenu(false)} style={{ background: "#38bdf8", color: "var(--text-main)", padding: "16px", borderRadius: 12, textDecoration: "none", textAlign: "center", fontWeight: 800 }}>Admin Panel</Link>
                    <button onClick={() => { logout(); setMenu(false); }} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", padding: "16px", borderRadius: 12, cursor: "pointer", fontWeight: 800 }}>Logout</button>
                  </div>
                ) : !loc.pathname.startsWith("/sport/") ? (
                  <Link to="/login" onClick={() => setMenu(false)} style={{ textDecoration: "none", marginTop: "auto" }}>
                    <button style={{ width: "100%", background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)", color: "#ffffff", border: "none", padding: "16px", borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 16 }}>
                      Staff Login
                    </button>
                  </Link>
                ) : null}
              </div>
            </>
          )}

          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {children}
          </div>
        </>
      )}
      </div>
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
              <Route path="/archives" element={<Archives />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </DatabaseProvider>
  );
}
