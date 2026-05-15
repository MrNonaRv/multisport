import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Trophy, ArrowRight, Activity } from "lucide-react";
import { useW, SPORT_THEMES, S_STATS } from "../db";
import { useDatabase } from "../context/DatabaseContext";
import { useAuth } from "../context/AuthContext";
import { Match, Team, User } from "../types";
import LiveMatchControlModal from "../components/LiveMatchControlModal";

const MatchCard = React.memo(({ 
  m, 
  t1, 
  t2, 
  theme, 
  user, 
  updateMatchDetails, 
  updateMatchScore,
  setLiveControlMatch,
  onViewBoxScore
}: { 
  m: Match; 
  t1: Team | undefined; 
  t2: Team | undefined; 
  theme: any; 
  user: User | null; 
  updateMatchDetails: (id: number, v: string, r: string, p?: string, t?: string) => void; 
  updateMatchScore: (id: number, s1: number, s2: number) => void; 
  setLiveControlMatch: (id: number) => void;
  onViewBoxScore: (id: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editVenue, setEditVenue] = useState(m.venue || "");
  const [editReferee, setEditReferee] = useState(m.referee || "");
  const [editPeriod, setEditPeriod] = useState(m.current_period || "");
  const [editTime, setEditTime] = useState(m.remaining_time || "");
  const [editScore1, setEditScore1] = useState(m.score_team1);
  const [editScore2, setEditScore2] = useState(m.score_team2);

  const [displayTime, setDisplayTime] = useState(m.remaining_time || "");

  useEffect(() => {
    let interval: any;
    if (m.clock_status === "running" && m.last_clock_update !== undefined && m.remaining_seconds !== undefined) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - m.last_clock_update!) / 1000);
        let currentRemaining = m.remaining_seconds! - elapsed;
        if (currentRemaining < 0) currentRemaining = 0;
        
        const mins = Math.floor(currentRemaining / 60);
        const secs = currentRemaining % 60;
        setDisplayTime(`${mins}:${secs.toString().padStart(2, "0")}`);
      }, 1000);
    } else {
      setDisplayTime(m.remaining_time || "");
    }
    return () => clearInterval(interval);
  }, [m.clock_status, m.last_clock_update, m.remaining_seconds, m.remaining_time]);

  const isLive = m.status === "live";
  const isCompleted = m.status === "completed";
  const t1Wins = isCompleted && m.winner === t1?.team_name;
  const t2Wins = isCompleted && m.winner === t2?.team_name;

  const handleSave = () => {
    if (user?.role !== "ADMIN" && user?.role !== "TABULATOR") {
      alert("Only admins and tabulators can edit match details.");
      return;
    }
    updateMatchDetails(m.match_id, editVenue, editReferee, editPeriod, editTime);
    if (!isCompleted) {
      updateMatchScore(m.match_id, editScore1, editScore2);
    } else if (editScore1 !== m.score_team1 || editScore2 !== m.score_team2) {
      alert("Cannot edit scores for a completed match.");
    }
    setIsEditing(false);
  };

  return (
    <div style={{ background: "var(--panel-bg)", backdropFilter: "blur(10px)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 24, boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 12, fontWeight: 800, background: isLive ? "#ef4444" : "var(--border-color)", color: isLive ? "#ffffff" : "var(--text-main)", padding: "4px 12px", borderRadius: 20, textTransform: "uppercase" }}>{m.status}</span>
        <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>{m.game_label} • {m.match_date}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1, textAlign: "center", opacity: isCompleted && !t1Wins ? 0.5 : 1 }}>
          {t1?.logo ? (
            <img src={t1.logo} alt={t1.team_name} style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", margin: "0 auto 10px", border: `2px solid ${t1Wins ? "#10b981" : "var(--border-hover)"}` }} />
          ) : (
            <div style={{ width: 60, height: 60, background: t1Wins ? "#10b98120" : "var(--border-color)", backdropFilter: "blur(5px)", border: `2px solid ${t1Wins ? "#10b981" : "var(--border-hover)"}`, borderRadius: "50%", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", color: t1Wins ? "#10b981" : "var(--text-main)", fontWeight: 900, fontSize: 10 }}>{t1?.team_name.substring(0,2).toUpperCase()}</div>
          )}
          <div style={{ fontWeight: 800, fontSize: 14, color: t1Wins ? "#10b981" : "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>{t1?.team_name} {t1Wins && <Trophy size={16} color="#10b981" />}</div>
          {isLive && m.timeouts_team1 !== undefined && <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4, fontWeight: 800 }}>Timeouts: {m.timeouts_team1}</div>}
          {t1Wins && <div style={{ fontSize: 10, color: "#10b981", marginTop: 6, textTransform: "uppercase", fontWeight: 900, background: "#10b98120", padding: "2px 8px", borderRadius: 12, display: "inline-block" }}>Winner</div>}
          {isCompleted && !t1Wins && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, textTransform: "uppercase", fontWeight: 900, background: "var(--border-color)", padding: "2px 8px", borderRadius: 12, display: "inline-block" }}>Defeated</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: t1Wins ? "#10b981" : (isCompleted && !t1Wins ? "var(--text-muted)" : "var(--text-main)") }}>{m.score_team1}</div>
          <div style={{ fontSize: 18, fontWeight: 700, opacity: 0.5 }}>VS</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: t2Wins ? "#10b981" : (isCompleted && !t2Wins ? "var(--text-muted)" : "var(--text-main)") }}>{m.score_team2}</div>
        </div>
        <div style={{ flex: 1, textAlign: "center", opacity: isCompleted && !t2Wins ? 0.5 : 1 }}>
          {t2?.logo ? (
            <img src={t2.logo} alt={t2.team_name} style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", margin: "0 auto 10px", border: `2px solid ${t2Wins ? "#10b981" : "var(--border-hover)"}` }} />
          ) : (
            <div style={{ width: 60, height: 60, background: t2Wins ? "#10b98120" : "var(--border-color)", backdropFilter: "blur(5px)", border: `2px solid ${t2Wins ? "#10b981" : "var(--border-hover)"}`, borderRadius: "50%", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", color: t2Wins ? "#10b981" : "var(--text-main)", fontWeight: 900, fontSize: 10 }}>{t2?.team_name.substring(0,2).toUpperCase()}</div>
          )}
          <div style={{ fontWeight: 800, fontSize: 14, color: t2Wins ? "#10b981" : "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>{t2Wins && <Trophy size={16} color="#10b981" />} {t2?.team_name}</div>
          {isLive && m.timeouts_team2 !== undefined && <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4, fontWeight: 800 }}>Timeouts: {m.timeouts_team2}</div>}
          {t2Wins && <div style={{ fontSize: 10, color: "#10b981", marginTop: 6, textTransform: "uppercase", fontWeight: 900, background: "#10b98120", padding: "2px 8px", borderRadius: 12, display: "inline-block" }}>Winner</div>}
          {isCompleted && !t2Wins && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, textTransform: "uppercase", fontWeight: 900, background: "var(--border-color)", padding: "2px 8px", borderRadius: 12, display: "inline-block" }}>Defeated</div>}
        </div>
      </div>
      {isLive && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#ef4444", animation: "pulse 2s infinite", marginBottom: (m.current_period || displayTime) ? 8 : 0 }}>● LIVE UPDATING</div>
          {(m.current_period || displayTime) && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(239, 68, 68, 0.1)", padding: "4px 12px", borderRadius: 12, border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              {m.current_period && <span style={{ color: "#ef4444", fontWeight: 800, fontSize: 12 }}>{m.current_period}</span>}
              {m.current_period && displayTime && <span style={{ color: "rgba(239, 68, 68, 0.5)" }}>|</span>}
              {displayTime && <span style={{ color: "#ef4444", fontWeight: 800, fontSize: 12, fontFamily: "monospace" }}>{displayTime}</span>}
            </div>
          )}
          {m.recent_action && (
            <div style={{ marginTop: 12, background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#38bdf8", animation: "pulse 2s infinite" }}></div>
              <span style={{ color: "var(--text-main)", fontSize: 13, fontWeight: 700 }}>{m.recent_action.player_name}</span>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>({m.recent_action.team_id === t1?.team_id ? t1?.team_name : t2?.team_name})</span>
              <span style={{ color: "#38bdf8", fontSize: 13, fontWeight: 800 }}>{m.recent_action.action}</span>
            </div>
          )}
        </div>
      )}
      {(m.venue || m.referee || user?.role === "ADMIN" || user?.role === "TABULATOR") && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 10, fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
          {isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {!isCompleted && (
                <>
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>{t1?.team_name} Score</label>
                      <input 
                        type="number" 
                        value={editScore1} 
                        onChange={e => setEditScore1(parseInt(e.target.value) || 0)} 
                        style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-hover)", color: "var(--text-main)", padding: "6px 12px", borderRadius: 4 }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>{t2?.team_name} Score</label>
                      <input 
                        type="number" 
                        value={editScore2} 
                        onChange={e => setEditScore2(parseInt(e.target.value) || 0)} 
                        style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-hover)", color: "var(--text-main)", padding: "6px 12px", borderRadius: 4 }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Period (e.g. Q1, H2)</label>
                      <input 
                        type="text" 
                        value={editPeriod} 
                        onChange={e => setEditPeriod(e.target.value)} 
                        placeholder="e.g. Q1, H2" 
                        style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-hover)", color: "var(--text-main)", padding: "6px 12px", borderRadius: 4 }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Time (e.g. 10:00)</label>
                      <input 
                        type="text" 
                        value={editTime} 
                        onChange={e => setEditTime(e.target.value)} 
                        placeholder="e.g. 10:00" 
                        style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-hover)", color: "var(--text-main)", padding: "6px 12px", borderRadius: 4 }}
                      />
                    </div>
                  </div>
                </>
              )}
              <input 
                type="text" 
                value={editVenue} 
                onChange={e => setEditVenue(e.target.value)} 
                placeholder="Venue" 
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-hover)", color: "var(--text-main)", padding: "6px 12px", borderRadius: 4 }}
              />
              <input 
                type="text" 
                value={editReferee} 
                onChange={e => setEditReferee(e.target.value)} 
                placeholder="Referee" 
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-hover)", color: "var(--text-main)", padding: "6px 12px", borderRadius: 4 }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button 
                  onClick={() => setIsEditing(false)} 
                  style={{ background: "transparent", border: "1px solid var(--border-hover)", color: "var(--text-main)", padding: "4px 12px", borderRadius: 4, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  style={{ background: theme.accent, border: "none", color: "var(--text-main)", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontWeight: 800 }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 16 }}>
                {m.venue && <div style={{ display: "flex", alignItems: "center", gap: 6 }}>📍 {m.venue}</div>}
                {m.referee && <div style={{ display: "flex", alignItems: "center", gap: 6 }}>👤 Ref: {m.referee}</div>}
              </div>
              {(user?.role === "ADMIN" || user?.role === "TABULATOR") && (
                <div style={{ display: "flex", gap: 8 }}>
                  {isLive && (
                    <button 
                      onClick={() => setLiveControlMatch(m.match_id)}
                      style={{ background: "#ef4444", border: "none", color: "var(--text-main)", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 10, textTransform: "uppercase", fontWeight: 800 }}
                    >
                      Live Control
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsEditing(true);
                      setEditVenue(m.venue || "");
                      setEditReferee(m.referee || "");
                      setEditPeriod(m.current_period || "");
                      setEditTime(m.remaining_time || "");
                      setEditScore1(m.score_team1);
                      setEditScore2(m.score_team2);
                    }}
                    style={{ background: "transparent", border: "1px solid var(--border-hover)", color: "var(--text-main)", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 10, textTransform: "uppercase" }}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {onViewBoxScore && (
        <div style={{ marginTop: 16, pt: 16, borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
          <button 
            onClick={() => onViewBoxScore(m.match_id)}
            style={{ background: "var(--panel-bg)", border: `1px solid ${theme.accent}40`, color: theme.accent, padding: "8px 24px", borderRadius: 20, cursor: "pointer", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}
          >
            View Match Dashboard
          </button>
        </div>
      )}
    </div>
  );
});

export default function SportPage() {
  const { sportName } = useParams();
  const sport = sportName ? sportName.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "Basketball";
  const { db, updateMatchDetails, updateMatchScore, addMatch } = useDatabase();
  const { user } = useAuth();
  const w = useW();
  const mob = w < 768;
  const [sec, setSec] = useState("home");
  const [selTeam, setSelTeam] = useState<number | null>(null);
  const [selectedPlayerModal, setSelectedPlayerModal] = useState<number | null>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<number | null>(null);
  const [showAddMatchModal, setShowAddMatchModal] = useState(false);
  const [liveControlMatch, setLiveControlMatch] = useState<number | null>(null);
  const [publicBoxScoreMatch, setPublicBoxScoreMatch] = useState<number | null>(null);

  const loc = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const matchId = params.get("match");
    if (matchId) {
      setPublicBoxScoreMatch(parseInt(matchId));
      setSec("matches");
    }
  }, [loc.search]);

  const [newMatch, setNewMatch] = useState({
    team1_id: "",
    team2_id: "",
    match_date: "",
    game_label: "",
    venue: "",
    referee: "",
    scheduled_start_time: ""
  });

  const tms = useMemo(() => db.teams.filter(t => t.sport === sport), [db.teams, sport]);
  const pls = useMemo(() => db.players.filter(p => p.sport === sport), [db.players, sport]);
  const mtc = useMemo(() => db.matches.filter(m => m.sport === sport), [db.matches, sport]);
  const sts = useMemo(() => db.playerStats.filter(s => s.sport === sport), [db.playerStats, sport]);

  const teamsMap = useMemo(() => {
    const map: Record<number, any> = {};
    db.teams.forEach(t => map[t.team_id] = t);
    return map;
  }, [db.teams]);

  const playersMap = useMemo(() => {
    const map: Record<number, any> = {};
    db.players.forEach(p => map[p.player_id] = p);
    return map;
  }, [db.players]);

  const aggregatedStats = useMemo(() => {
    const map: Record<number, any> = {};
    const sportStats = S_STATS[sport as keyof typeof S_STATS] || [];
    
    sts.forEach(s => {
      if (!map[s.player_id]) {
        map[s.player_id] = { ...s };
        sportStats.forEach(stat => {
          map[s.player_id][stat] = (s as any)[stat] || 0;
        });
      } else {
        sportStats.forEach(stat => {
          map[s.player_id][stat] = (map[s.player_id][stat] || 0) + ((s as any)[stat] || 0);
        });
      }
    });
    return Object.values(map);
  }, [sts, sport]);

  const sortedStandings = useMemo(() => {
    const statsMap: Record<number, { won: number, lost: number }> = {};
    
    tms.forEach(t => {
      statsMap[t.team_id] = { won: 0, lost: 0 };
    });

    mtc.forEach(m => {
      if (m.status === "completed" && m.winner) {
        const t1 = teamsMap[m.team1_id];
        const t2 = teamsMap[m.team2_id];
        
        if (t1 && m.winner === t1.team_name) {
          if (statsMap[m.team1_id]) statsMap[m.team1_id].won++;
          if (statsMap[m.team2_id]) statsMap[m.team2_id].lost++;
        } else if (t2 && m.winner === t2.team_name) {
          if (statsMap[m.team2_id]) statsMap[m.team2_id].won++;
          if (statsMap[m.team1_id]) statsMap[m.team1_id].lost++;
        }
      }
    });

    return tms.map(t => {
      const { won, lost } = statsMap[t.team_id] || { won: 0, lost: 0 };
      const total = won + lost;
      const pct = total > 0 ? (won / total * 100) : 0;
      return { ...t, won, lost, total, pct };
    }).sort((a, b) => b.pct - a.pct || b.won - a.won);
  }, [tms, mtc, teamsMap]);

  const topPerformer = useMemo(() => {
    if (aggregatedStats.length === 0) return null;
    const primaryStat = S_STATS[sport as keyof typeof S_STATS]?.[0] || "points";
    const top = [...aggregatedStats].sort((a, b) => ((b as any)[primaryStat] || 0) - ((a as any)[primaryStat] || 0))[0];
    const player = playersMap[top.player_id];
    const team = player ? teamsMap[player.team_id] : null;
    return { ...top, player, team, primaryStat };
  }, [aggregatedStats, sport, playersMap, teamsMap]);

  const theme = SPORT_THEMES[sport] || SPORT_THEMES["Basketball"];

  const gTeam = (id: number) => teamsMap[id];

  const navs = [
    { id: "home", lbl: "HOME" },
    { id: "matches", lbl: "MATCHES" },
    { id: "teams", lbl: "TEAMS" },
    { id: "leaderboards", lbl: "LEADERBOARDS" },
    { id: "standings", lbl: "STANDINGS" },
    { id: "finals", lbl: "GAME FINALS" },
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "transparent", 
      backgroundImage: `linear-gradient(rgba(var(--bg-rgb), 0.85), rgba(var(--bg-rgb), 0.85)), url(${theme.bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      fontFamily: "'Inter', sans-serif",
      color: "var(--text-main)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background decorative elements */}
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "40%", background: `repeating-linear-gradient(45deg, ${theme.patternColor}, ${theme.patternColor} 10px, transparent 10px, transparent 20px)`, zIndex: 0 }} />
      <div style={{ position: "absolute", top: 0, right: "20%", bottom: 0, width: "20%", background: "var(--panel-bg)", transform: "skewX(-15deg)", zIndex: 0 }} />
      <div style={{ position: "absolute", top: 0, right: "10%", bottom: 0, width: "5%", background: theme.accent, transform: "skewX(-15deg)", zIndex: 0 }} />

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: mob ? "15px 20px" : "20px 40px" }}>
          <div style={{ fontSize: mob ? 20 : 28, fontWeight: 900, display: "flex", alignItems: "center", gap: 10, letterSpacing: -1 }}>
            <span style={{ fontSize: mob ? 24 : 36 }}>{theme.icon}</span> {sport.toUpperCase()} METRICS
          </div>
          {!mob && (
            <div style={{ display: "flex", gap: 24, fontWeight: 800, fontSize: 13, textTransform: "uppercase" }}>
              {navs.map(n => (
                <div key={n.id} onClick={() => setSec(n.id)} style={{ 
                  cursor: "pointer", 
                  borderBottom: sec === n.id ? `3px solid ${theme.accent}` : "3px solid transparent", 
                  paddingBottom: 4,
                  color: sec === n.id ? theme.accent : "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>
                  {n.id === "finals" && <Trophy size={14} />}
                  {n.lbl}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <button style={{ padding: mob ? "8px 16px" : "10px 28px", borderRadius: 24, border: "2px solid var(--border-hover)", background: "var(--border-color)", color: "var(--text-main)", fontWeight: 800, cursor: "pointer", fontSize: mob ? 12 : 14, textTransform: "uppercase", backdropFilter: "blur(10px)" }}>
                {mob ? "BACK" : "HOME"}
              </button>
            </Link>
            {user && !mob && (
              <Link to="/dashboard" style={{ textDecoration: "none" }}>
                <button style={{ padding: "10px 28px", borderRadius: 24, border: "none", background: theme.bg, color: "var(--text-main)", fontWeight: 800, cursor: "pointer", fontSize: 14, textTransform: "uppercase", boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
                  DASHBOARD
                </button>
              </Link>
            )}
          </div>
        </div>

        {mob && (
          <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "0 20px 10px", scrollbarWidth: "none", fontWeight: 800, fontSize: 11, textTransform: "uppercase" }}>
            {navs.map(n => (
              <div key={n.id} onClick={() => setSec(n.id)} style={{ 
                cursor: "pointer", 
                borderBottom: sec === n.id ? `2px solid ${theme.accent}` : "2px solid transparent", 
                paddingBottom: 2, 
                whiteSpace: "nowrap",
                color: sec === n.id ? theme.accent : "inherit",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}>
                {n.id === "finals" && <Trophy size={10} />}
                {n.lbl}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: mob ? "10px 20px 40px" : "20px 40px 60px" }}>
          {/* MATCHES SECTION */}
          {sec === "matches" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h2 style={{ fontSize: mob ? 28 : 36, fontWeight: 900, letterSpacing: -1, margin: 0 }}>MATCH UPDATES</h2>
                {(user?.role === "ADMIN" || user?.role === "TABULATOR") && (
                  <button 
                    onClick={() => setShowAddMatchModal(true)}
                    style={{ background: theme.accent, color: "var(--text-main)", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 800, cursor: "pointer", fontSize: 14 }}
                  >
                    + ADD MATCH
                  </button>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(auto-fill, minmax(400px, 1fr))", gap: 24 }}>
                {mtc.map(m => (
                  <MatchCard 
                    key={m.match_id} 
                    m={m} 
                    t1={teamsMap[m.team1_id]} 
                    t2={teamsMap[m.team2_id]} 
                    theme={theme} 
                    user={user} 
                    updateMatchDetails={updateMatchDetails} 
                    updateMatchScore={updateMatchScore}
                    setLiveControlMatch={setLiveControlMatch}
                    onViewBoxScore={setPublicBoxScoreMatch}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TEAMS SECTION */}
          {sec === "teams" && (
            <div style={{ display: "flex", flexDirection: mob ? "column" : "row", gap: mob ? 30 : 60 }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ textAlign: "center", fontSize: mob ? 28 : 36, fontWeight: 900, marginBottom: mob ? 20 : 40, letterSpacing: -1 }}>ALL TEAMS</h2>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${mob ? 3 : 4}, 1fr)`, gap: mob ? 15 : 30 }}>
                  {tms.map(t => {
                    const isHighlighted = hoveredPlayer ? playersMap[hoveredPlayer]?.team_id === t.team_id : selTeam === t.team_id;
                    return (
                    <div key={t.team_id} onClick={() => setSelTeam(t.team_id === selTeam ? null : t.team_id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", transition: "transform 0.2s", transform: isHighlighted ? "scale(1.1)" : "scale(1)" }}>
                      <div style={{ width: mob ? 80 : 110, height: mob ? 80 : 110, borderRadius: "50%", background: isHighlighted ? theme.accent : "var(--border-color)", backdropFilter: "blur(10px)", border: `4px solid ${isHighlighted ? "var(--text-main)" : "var(--border-hover)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)", fontWeight: 900, fontSize: mob ? 10 : 14, textAlign: "center", boxShadow: isHighlighted ? `0 0 30px ${theme.accent}` : "0 10px 20px rgba(0,0,0,0.3)", padding: 10, transition: "all 0.3s" }}>
                        {t.team_name}
                      </div>
                      <div style={{ marginTop: 12, fontWeight: 800, textAlign: "center", fontSize: mob ? 11 : 14, color: isHighlighted ? theme.accent : "var(--text-main)" }}>{t.team_name}</div>
                    </div>
                  )})}
                </div>
              </div>
              <div style={{ flex: 1, background: "var(--panel-bg)", backdropFilter: "blur(15px)", borderRadius: 16, padding: 0, boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", overflow: "hidden", alignSelf: "flex-start", color: "var(--text-main)", border: "1px solid var(--border-color)", width: "100%" }}>
                <h3 style={{ fontSize: 24, fontWeight: 900, padding: "24px 24px 16px", margin: 0 }}>PLAYERS</h3>
                <div style={{ maxHeight: 600, overflowY: "auto", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--border-color)", color: "var(--text-main)" }}>
                        <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 13, fontWeight: 700 }}>Team</th>
                        <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 13, fontWeight: 700 }}>Player Name</th>
                        <th style={{ padding: "16px 24px", textAlign: "center", fontSize: 13, fontWeight: 700 }}>No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pls.filter(p => selTeam ? p.team_id === selTeam : true).map((p, i) => (
                        <tr key={p.player_id} 
                            onMouseEnter={() => setHoveredPlayer(p.player_id)}
                            onMouseLeave={() => setHoveredPlayer(null)}
                            onClick={() => setSelectedPlayerModal(p.player_id)}
                            style={{ borderBottom: "1px solid var(--panel-bg)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)", cursor: "pointer", transition: "background 0.2s" }}
                            onMouseOver={e => e.currentTarget.style.background = "var(--panel-bg)"}
                            onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)"}
                        >
                          <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--text-muted)" }}>{gTeam(p.team_id)?.team_name}</td>
                          <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 600 }}>{p.player_name}</td>
                          <td style={{ padding: "16px 24px", textAlign: "center", fontSize: 14 }}>{p.jersey_number}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* GAME FINALS SECTION */}
          {sec === "finals" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              {(() => {
                const bracket = db.brackets.find(b => b.sport === sport);
                if (!bracket) return (
                  <div style={{ textAlign: "center", padding: 100, background: "var(--border-color)", borderRadius: 16 }}>
                    <div style={{ fontSize: 64, marginBottom: 20 }}>🏆</div>
                    <h3 style={{ fontSize: 24, fontWeight: 900 }}>Finals Bracket Coming Soon</h3>
                    <p style={{ opacity: 0.7 }}>The tournament is still in the elimination phase. Check back later for the finals bracket!</p>
                  </div>
                );

                return (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 24 }}>
                      <div style={{ background: "var(--panel-bg)", backdropFilter: "blur(10px)", borderRadius: 12, padding: mob ? 20 : 40, color: "var(--text-main)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", border: "1px solid var(--border-color)" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>{sport} Finals</div>
                        <div style={{ display: "flex", alignItems: "center", gap: mob ? 20 : 40, width: "100%", justifyContent: "center" }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ width: mob ? 60 : 100, height: mob ? 60 : 100, borderRadius: "50%", background: "var(--border-color)", border: "2px solid var(--border-hover)", color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: mob ? 24 : 40, fontWeight: 900, marginBottom: 10 }}>{bracket.final.team1[0]}</div>
                            <div style={{ fontWeight: 800, fontSize: 14 }}>{bracket.final.team1}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div style={{ fontSize: mob ? 18 : 28, fontWeight: 900 }}>{bracket.champion.toUpperCase()} Wins</div>
                            <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.7 }}>Series Result</div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ width: mob ? 60 : 100, height: mob ? 60 : 100, borderRadius: "50%", background: "var(--border-hover)", color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: mob ? 24 : 40, fontWeight: 900, marginBottom: 10, border: "2px solid var(--text-main)" }}>{bracket.final.team2[0]}</div>
                            <div style={{ fontWeight: 800, fontSize: 14 }}>{bracket.final.team2}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ background: "var(--panel-bg)", backdropFilter: "blur(15px)", borderRadius: 16, overflow: "hidden", boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", color: "var(--text-main)", border: "1px solid var(--border-color)", overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", minWidth: 400 }}>
                          <thead>
                            <tr style={{ background: "var(--border-color)", color: "var(--text-main)" }}>
                              <th style={{ padding: 16, fontSize: 13 }}>Game</th>
                              <th style={{ padding: 16, fontSize: 13 }}>Winner</th>
                              <th style={{ padding: 16, fontSize: 13 }}>Score</th>
                              <th style={{ padding: 16, fontSize: 13 }}>Loser</th>
                            </tr>
                          </thead>
                          <tbody>
                            {db.finalsGames.filter(g => g.sport === sport).map((g, i) => (
                              <tr key={i} style={{ borderBottom: "1px solid var(--panel-bg)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                                <td style={{ padding: 16, fontSize: 14, color: "var(--text-muted)" }}>{g.game}</td>
                                <td style={{ padding: 16, fontSize: 14, fontWeight: 600, color: "#10b981" }}>{g.winner}</td>
                                <td style={{ padding: 16, fontSize: 14 }}>{g.scoreA} - {g.scoreB}</td>
                                <td style={{ padding: 16, fontSize: 14, fontWeight: 600, color: "#ef4444" }}>{g.loser}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div style={{ background: "var(--border-color)", backdropFilter: "blur(10px)", borderRadius: 16, padding: mob ? 20 : 40, border: "1px solid var(--border-hover)", overflowX: "auto" }}>
                      <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 30, textAlign: "center" }}>TOURNAMENT BRACKET</h3>
                      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", gap: 20, flexWrap: mob ? "wrap" : "nowrap", minWidth: mob ? "auto" : 800 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.6, textAlign: "center" }}>QUARTER FINALS</div>
                          {bracket?.qf?.map((match, i) => (
                            <div key={i} style={{ background: "var(--panel-bg)", backdropFilter: "blur(10px)", color: "var(--text-main)", padding: "10px 20px", borderRadius: 8, minWidth: 180, boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", border: "1px solid var(--border-color)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: 4, marginBottom: 4 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontWeight: match.winner === match.team1 ? 900 : 500, color: match.winner === match.team1 ? "#10b981" : "var(--text-muted)" }}>{match.team1}</span>
                                  {match.winner === match.team1 && <span style={{ fontSize: 9, background: "#10b981", color: "var(--text-main)", padding: "1px 4px", borderRadius: 4, fontWeight: 900 }}>W</span>}
                                  {match.winner !== match.team1 && match.winner && <span style={{ fontSize: 9, background: "#ef4444", color: "var(--text-main)", padding: "1px 4px", borderRadius: 4, fontWeight: 900 }}>L</span>}
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 900 }}>{match.score1}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontWeight: match.winner === match.team2 ? 900 : 500, color: match.winner === match.team2 ? "#10b981" : "var(--text-muted)" }}>{match.team2}</span>
                                  {match.winner === match.team2 && <span style={{ fontSize: 9, background: "#10b981", color: "var(--text-main)", padding: "1px 4px", borderRadius: 4, fontWeight: 900 }}>W</span>}
                                  {match.winner !== match.team2 && match.winner && <span style={{ fontSize: 9, background: "#ef4444", color: "var(--text-main)", padding: "1px 4px", borderRadius: 4, fontWeight: 900 }}>L</span>}
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 900 }}>{match.score2}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {!mob && <div style={{ display: "flex", alignItems: "center", padding: "0 10px" }}><ArrowRight size={32} color="var(--border-hover)" /></div>}
                        <div style={{ display: "flex", flexDirection: "column", gap: 60 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.6, textAlign: "center" }}>SEMI FINALS</div>
                          {bracket?.sf?.map((match, i) => (
                            <div key={i} style={{ background: "var(--panel-bg)", backdropFilter: "blur(10px)", color: "var(--text-main)", padding: "10px 20px", borderRadius: 8, minWidth: 180, boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", border: "1px solid var(--border-color)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: 4, marginBottom: 4 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontWeight: match.winner === match.team1 ? 900 : 500, color: match.winner === match.team1 ? "#10b981" : "var(--text-muted)" }}>{match.team1}</span>
                                  {match.winner === match.team1 && <span style={{ fontSize: 9, background: "#10b981", color: "var(--text-main)", padding: "1px 4px", borderRadius: 4, fontWeight: 900 }}>W</span>}
                                  {match.winner !== match.team1 && match.winner && <span style={{ fontSize: 9, background: "#ef4444", color: "var(--text-main)", padding: "1px 4px", borderRadius: 4, fontWeight: 900 }}>L</span>}
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 900 }}>{match.score1}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontWeight: match.winner === match.team2 ? 900 : 500, color: match.winner === match.team2 ? "#10b981" : "var(--text-muted)" }}>{match.team2}</span>
                                  {match.winner === match.team2 && <span style={{ fontSize: 9, background: "#10b981", color: "var(--text-main)", padding: "1px 4px", borderRadius: 4, fontWeight: 900 }}>W</span>}
                                  {match.winner !== match.team2 && match.winner && <span style={{ fontSize: 9, background: "#ef4444", color: "var(--text-main)", padding: "1px 4px", borderRadius: 4, fontWeight: 900 }}>L</span>}
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 900 }}>{match.score2}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {!mob && <div style={{ display: "flex", alignItems: "center", padding: "0 10px" }}><ArrowRight size={32} color="var(--border-hover)" /></div>}
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.6, textAlign: "center" }}>FINALS</div>
                          <div style={{ background: theme.accent, color: "var(--text-main)", padding: "15px 30px", borderRadius: 12, minWidth: 220, boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", border: "2px solid var(--text-main)", textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: bracket.final.winner === bracket.final.team1 ? 900 : 500, fontSize: 18 }}>{bracket.final.team1}</span>
                                {bracket.final.winner === bracket.final.team1 && <span style={{ fontSize: 10, background: "#10b981", color: "var(--text-main)", padding: "2px 6px", borderRadius: 4, fontWeight: 900 }}>WINNER</span>}
                                {bracket.final.winner !== bracket.final.team1 && bracket.final.winner && <span style={{ fontSize: 10, background: "#ef4444", color: "var(--text-main)", padding: "2px 6px", borderRadius: 4, fontWeight: 900 }}>LOSER</span>}
                              </div>
                              <span style={{ fontWeight: 900, fontSize: 18 }}>{bracket.final.score1}</span>
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>VS</div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: bracket.final.winner === bracket.final.team2 ? 900 : 500, fontSize: 18 }}>{bracket.final.team2}</span>
                                {bracket.final.winner === bracket.final.team2 && <span style={{ fontSize: 10, background: "#10b981", color: "var(--text-main)", padding: "2px 6px", borderRadius: 4, fontWeight: 900 }}>WINNER</span>}
                                {bracket.final.winner !== bracket.final.team2 && bracket.final.winner && <span style={{ fontSize: 10, background: "#ef4444", color: "var(--text-main)", padding: "2px 6px", borderRadius: 4, fontWeight: 900 }}>LOSER</span>}
                              </div>
                              <span style={{ fontWeight: 900, fontSize: 18 }}>{bracket.final.score2}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* LEADERBOARDS SECTION */}
          {sec === "leaderboards" && (
            <div>
              <h2 style={{ textAlign: "center", fontSize: mob ? 28 : 36, fontWeight: 900, marginBottom: 30, letterSpacing: -1 }}>{sport.toUpperCase()} LEADERBOARD</h2>
              <div style={{ background: "var(--panel-bg)", backdropFilter: "blur(15px)", borderRadius: 16, padding: 0, position: "relative", overflow: "hidden", boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", border: "1px solid var(--border-color)", overflowX: "auto" }}>
                <div style={{ position: "absolute", right: -80, top: "50%", transform: "translateY(-50%)", fontSize: 500, opacity: 0.05, pointerEvents: "none" }}>{theme.icon}</div>
                
                <table style={{ width: "100%", borderCollapse: "collapse", position: "relative", zIndex: 1, minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: "var(--border-color)", color: "var(--text-main)" }}>
                      <th style={{ padding: "20px 24px", textAlign: "center", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>#</th>
                      <th style={{ padding: "20px 24px", textAlign: "left", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>TEAM</th>
                      <th style={{ padding: "20px 24px", textAlign: "left", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>PLAYER NAME</th>
                      {S_STATS[sport as keyof typeof S_STATS]?.map(st => (
                        <th key={st} style={{ padding: "20px 24px", textAlign: "center", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>{st.replace("_", " ")}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {aggregatedStats.sort((a,b) => {
                      const primaryStat = S_STATS[sport as keyof typeof S_STATS]?.[0] || "points";
                      return ((b as any)[primaryStat] || 0) - ((a as any)[primaryStat] || 0);
                    }).slice(0, 15).map((s, i) => {
                      const p = db.players.find(x => x.player_id === s.player_id);
                      const t = gTeam(p?.team_id || 0);
                      const sportStats = S_STATS[sport as keyof typeof S_STATS] || [];
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid var(--panel-bg)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)", transition: "background 0.2s", cursor: "pointer" }}
                          onClick={() => setSelectedPlayerModal(s.player_id)}
                          onMouseEnter={e => e.currentTarget.style.background = "var(--panel-bg)"}
                          onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)"}>
                          <td style={{ padding: "16px 24px", textAlign: "center", fontWeight: 900, fontSize: 16, color: i < 3 ? theme.accent : "var(--text-main)" }}>{i + 1}</td>
                          <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--text-muted)" }}>{t?.team_name}</td>
                          <td style={{ padding: "16px 24px", fontSize: 15, fontWeight: 700 }}>{p?.player_name}</td>
                          {sportStats.map(st => (
                            <td key={st} style={{ padding: "16px 24px", textAlign: "center", fontWeight: 900, fontSize: 14, color: st === sportStats[0] ? theme.accent : "var(--text-main)" }}>{(s as any)[st] || 0}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STANDINGS SECTION */}
          {sec === "standings" && (
            <div>
              <h2 style={{ textAlign: "center", fontSize: mob ? 28 : 36, fontWeight: 900, marginBottom: 30, letterSpacing: -1 }}>STANDINGS</h2>
              <div style={{ background: "var(--panel-bg)", backdropFilter: "blur(15px)", borderRadius: 16, overflow: "hidden", boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", border: "1px solid var(--border-color)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
                  <thead>
                    <tr style={{ background: "var(--border-color)", color: "var(--text-main)" }}>
                      <th style={{ padding: 20, fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>Pos</th>
                      <th style={{ padding: 20, fontSize: 13, fontWeight: 800, textTransform: "uppercase", textAlign: "left" }}>Team</th>
                      <th style={{ padding: 20, fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>GP</th>
                      <th style={{ padding: 20, fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>W</th>
                      <th style={{ padding: 20, fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>L</th>
                      <th style={{ padding: 20, fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>Win %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStandings.map((t, i) => {
                      return (
                        <tr key={t.team_id} style={{ borderBottom: "1px solid var(--panel-bg)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                          <td style={{ padding: 16, fontSize: 16, fontWeight: 900 }}>{i + 1}</td>
                          <td style={{ padding: 16, fontSize: 15, fontWeight: 700, textAlign: "left" }}>{t.team_name}</td>
                          <td style={{ padding: 16, fontSize: 16, fontWeight: 700 }}>{t.total}</td>
                          <td style={{ padding: 16, fontSize: 16, color: "#10b981", fontWeight: 900 }}>{t.won}</td>
                          <td style={{ padding: 16, fontSize: 16, color: "#ef4444", fontWeight: 900 }}>{t.lost}</td>
                          <td style={{ padding: 16, fontSize: 16, fontWeight: 900 }}>{t.pct.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* HOME SECTION */}
          {sec === "home" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "2fr 1fr", gap: 24 }}>
                <div style={{ background: "var(--panel-bg)", backdropFilter: "blur(20px)", borderRadius: 24, padding: mob ? 40 : 60, color: "var(--text-main)", textAlign: "left", boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", border: "1px solid var(--border-color)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ position: "absolute", top: -50, left: -50, width: 200, height: 200, background: theme.bg, filter: "blur(100px)", opacity: 0.3, borderRadius: "50%" }} />
                  <div style={{ position: "absolute", bottom: -50, right: -50, width: 200, height: 200, background: theme.accent, filter: "blur(100px)", opacity: 0.3, borderRadius: "50%" }} />
                  
                  <div style={{ fontSize: mob ? 40 : 60, marginBottom: 10, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>{theme.icon}</div>
                  <h2 style={{ fontSize: mob ? 36 : 64, fontWeight: 900, margin: 0, letterSpacing: -3, textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>{sport.toUpperCase()}</h2>
                  <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                    <span style={{ background: theme.bg, color: "var(--text-main)", padding: "6px 16px", borderRadius: 24, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>Tournament 2025</span>
                    <span style={{ background: "var(--border-color)", color: "var(--text-main)", padding: "6px 16px", borderRadius: 24, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>Live Coverage</span>
                  </div>
                  <p style={{ fontSize: mob ? 15 : 18, opacity: 0.9, maxWidth: 600, marginTop: 24, lineHeight: 1.6, fontWeight: 500 }}>
                    Experience the intensity of competitive {sport}. Track every point, follow your favorite teams, and stay updated with real-time analytics and championship standings.
                  </p>
                  <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
                    <button onClick={() => setSec("matches")} style={{ background: theme.bg, color: "var(--text-main)", border: "none", padding: "12px 28px", borderRadius: 32, fontWeight: 900, cursor: "pointer", fontSize: 13, textTransform: "uppercase", letterSpacing: 1, boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>Live Matches</button>
                    <button onClick={() => setSec("teams")} style={{ background: "var(--border-color)", color: "var(--text-main)", border: "1px solid var(--border-hover)", padding: "12px 28px", borderRadius: 32, fontWeight: 900, cursor: "pointer", fontSize: 13, textTransform: "uppercase", letterSpacing: 1, backdropFilter: "blur(10px)" }}>Explore Teams</button>
                  </div>
                </div>

                {topPerformer && (
                  <div style={{ background: "var(--panel-bg)", backdropFilter: "blur(10px)", borderRadius: 24, padding: 32, border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: theme.accent, textTransform: "uppercase", letterSpacing: 2, marginBottom: 20 }}>Top Performer</div>
                    <div style={{ width: 100, height: 100, borderRadius: "50%", background: "var(--border-color)", border: `4px solid ${theme.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 16 }}>👤</div>
                    <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{topPerformer.player?.player_name}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.6, marginBottom: 20 }}>{topPerformer.team?.team_name}</div>
                    <div style={{ background: "var(--border-color)", padding: "12px 24px", borderRadius: 16, width: "100%" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.5, textTransform: "uppercase" }}>{topPerformer.primaryStat.replace("_", " ")}</div>
                      <div style={{ fontSize: 32, fontWeight: 900, color: theme.accent }}>{(topPerformer as any)[topPerformer.primaryStat]}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 24 }}>
                <div style={{ background: "var(--panel-bg)", backdropFilter: "blur(10px)", borderRadius: 16, padding: 32, boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--panel-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🏆</div>
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>TOTAL TEAMS</h4>
                    <div style={{ fontSize: 32, fontWeight: 900 }}>{tms.length}</div>
                  </div>
                </div>
                <div style={{ background: "var(--panel-bg)", backdropFilter: "blur(10px)", borderRadius: 16, padding: 32, boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--panel-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>👤</div>
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>TOTAL PLAYERS</h4>
                    <div style={{ fontSize: 32, fontWeight: 900 }}>{pls.length}</div>
                  </div>
                </div>
                <div style={{ background: "var(--panel-bg)", backdropFilter: "blur(10px)", borderRadius: 16, padding: 32, boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--panel-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🔥</div>
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>COMPLETED</h4>
                    <div style={{ fontSize: 32, fontWeight: 900 }}>{mtc.filter(m => m.status === "completed").length}</div>
                  </div>
                </div>
              </div>

              {db.brackets.find(b => b.sport === sport) && (
                <div style={{ background: "var(--panel-bg)", backdropFilter: "blur(10px)", borderRadius: 24, padding: mob ? 30 : 50, border: "1px solid var(--border-color)", textAlign: "center" }}>
                  <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>TOURNAMENT BRACKET</h3>
                  <p style={{ opacity: 0.7, marginBottom: 30 }}>The road to the championship is heating up! View the full bracket and match results.</p>
                  <button onClick={() => setSec("finals")} style={{ background: theme.bg, color: "var(--text-main)", border: "none", padding: "14px 40px", borderRadius: 32, fontWeight: 900, cursor: "pointer", fontSize: 14, textTransform: "uppercase", letterSpacing: 1, boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>View Full Bracket</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedPlayerModal !== null && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--panel-bg)", borderRadius: 16, width: "100%", maxWidth: 600, border: "1px solid var(--border-color)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
            <div style={{ padding: 20, borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{playersMap[selectedPlayerModal]?.player_name} - Match Stats</h3>
                <button 
                  onClick={() => {
                    setSec("teams");
                    setSelTeam(playersMap[selectedPlayerModal]?.team_id);
                    setSelectedPlayerModal(null);
                  }}
                  style={{ background: "transparent", border: "none", color: theme.accent, padding: 0, cursor: "pointer", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}
                >
                  View Team
                </button>
              </div>
              <button onClick={() => setSelectedPlayerModal(null)} style={{ background: "transparent", border: "none", color: "var(--text-main)", fontSize: 24, cursor: "pointer" }}>&times;</button>
            </div>
            <div style={{ padding: 20, overflowY: "auto" }}>
              {sts.filter(s => s.player_id === selectedPlayerModal).length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>No match stats available for this player.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {sts.filter(s => s.player_id === selectedPlayerModal).map(s => {
                    const match = mtc.find(m => m.match_id === s.match_id);
                    const t1 = match ? gTeam(match.team1_id) : null;
                    const t2 = match ? gTeam(match.team2_id) : null;
                    const sportStats = S_STATS[sport as keyof typeof S_STATS] || [];
                    return (
                      <div key={s.stat_id} style={{ background: "var(--panel-bg)", borderRadius: 12, padding: 16, border: "1px solid var(--border-color)" }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                          {match ? `${match.game_label} • ${match.match_date}` : `Match ID: ${s.match_id}`}
                        </div>
                        {match && (
                          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "var(--text-main)" }}>
                            {t1?.team_name} vs {t2?.team_name}
                          </div>
                        )}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 12 }}>
                          {sportStats.map(st => (
                            <div key={st} style={{ background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 8, textAlign: "center" }}>
                              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>{st.replace("_", " ")}</div>
                              <div style={{ fontSize: 18, fontWeight: 900, color: theme.accent }}>{(s as any)[st] || 0}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Match Modal */}
      {showAddMatchModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--panel-bg)", border: `1px solid ${theme.accent}`, borderRadius: 16, padding: 30, width: "100%", maxWidth: 500, boxShadow: `0 0 40px ${theme.accent}40`, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20, color: "var(--text-main)" }}>ADD NEW MATCH</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 5 }}>Team 1</label>
                <select 
                  value={newMatch.team1_id} 
                  onChange={e => setNewMatch({...newMatch, team1_id: e.target.value})}
                  style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-hover)", color: "var(--text-main)" }}
                >
                  <option value="">Select Team 1</option>
                  {tms.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>Team 2</label>
                <select 
                  value={newMatch.team2_id} 
                  onChange={e => setNewMatch({...newMatch, team2_id: e.target.value})}
                  style={{ width: "100%", padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "2px solid var(--border-hover)", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }}
                >
                  <option value="" style={{ color: "#000" }}>Select Team 2</option>
                  {tms.map(t => <option key={t.team_id} value={t.team_id} style={{ color: "#000" }}>{t.team_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>Game Label (e.g. Elimination, Finals)</label>
                <input 
                  type="text" 
                  value={newMatch.game_label} 
                  onChange={e => setNewMatch({...newMatch, game_label: e.target.value})}
                  placeholder="e.g. Finals"
                  style={{ width: "100%", padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "2px solid var(--border-hover)", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>Date (e.g. Oct 25)</label>
                <input 
                  type="text" 
                  value={newMatch.match_date} 
                  onChange={e => setNewMatch({...newMatch, match_date: e.target.value})}
                  placeholder="e.g. Oct 25"
                  style={{ width: "100%", padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "2px solid var(--border-hover)", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>Venue</label>
                <input 
                  type="text" 
                  value={newMatch.venue} 
                  onChange={e => setNewMatch({...newMatch, venue: e.target.value})}
                  placeholder="e.g. Court 1"
                  style={{ width: "100%", padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "2px solid var(--border-hover)", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>Scheduled Start Time (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={newMatch.scheduled_start_time} 
                  onChange={e => setNewMatch({...newMatch, scheduled_start_time: e.target.value})}
                  style={{ width: "100%", padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "2px solid var(--border-hover)", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>Referee</label>
                <input 
                  type="text" 
                  value={newMatch.referee} 
                  onChange={e => setNewMatch({...newMatch, referee: e.target.value})}
                  placeholder="e.g. Ref Smith"
                  style={{ width: "100%", padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "2px solid var(--border-hover)", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }}
                />
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
                <button 
                  onClick={() => setShowAddMatchModal(false)}
                  style={{ flex: 1, padding: 16, borderRadius: 12, border: "2px solid var(--border-hover)", background: "transparent", color: "var(--text-main)", fontWeight: 900, cursor: "pointer", fontSize: 16 }}
                >
                  CANCEL
                </button>
                <button 
                  onClick={() => {
                    if (!newMatch.team1_id || !newMatch.team2_id || !newMatch.game_label || !newMatch.match_date) {
                      alert("Please fill in all required fields (Teams, Game Label, Date).");
                      return;
                    }
                    if (newMatch.team1_id === newMatch.team2_id) {
                      alert("Team 1 and Team 2 cannot be the same.");
                      return;
                    }
                    addMatch({
                      sport: sport,
                      team1_id: parseInt(newMatch.team1_id),
                      team2_id: parseInt(newMatch.team2_id),
                      match_date: newMatch.match_date,
                      score_team1: 0,
                      score_team2: 0,
                      winner: null,
                      status: "upcoming",
                      game_label: newMatch.game_label,
                      venue: newMatch.venue,
                      referee: newMatch.referee,
                      scheduled_start_time: newMatch.scheduled_start_time
                    });
                    setShowAddMatchModal(false);
                    setNewMatch({ team1_id: "", team2_id: "", match_date: "", game_label: "", venue: "", referee: "", scheduled_start_time: "" });
                  }}
                  style={{ flex: 2, padding: 16, borderRadius: 12, border: "none", background: theme.accent, color: "var(--text-main)", fontWeight: 900, cursor: "pointer", fontSize: 18, boxShadow: "0 0 20px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                >
                  + ADD MATCH
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {liveControlMatch && <LiveMatchControlModal matchId={liveControlMatch} onClose={() => setLiveControlMatch(null)} />}

      {/* Public Box Score Modal */}
      {publicBoxScoreMatch && (() => {
        const match = db.matches.find(m => m.match_id === publicBoxScoreMatch);
        if (!match) return null;
        const t1 = teamsMap[match.team1_id];
        const t2 = teamsMap[match.team2_id];
        const t1Players = db.players.filter(p => p.team_id === match.team1_id);
        const t2Players = db.players.filter(p => p.team_id === match.team2_id);
        const sportStats = S_STATS[match.sport as keyof typeof S_STATS] || ["points"];

        const getStat = (playerId: number, statKey: string) => {
          const stat = db.playerStats.find(s => s.match_id === match.match_id && s.player_id === playerId);
          return stat ? ((stat as any)[statKey] || 0) : 0;
        };

        return (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "var(--panel-bg)", border: `1px solid ${theme.accent}`, borderRadius: 16, width: "100%", maxWidth: 900, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: `0 0 40px ${theme.accent}40` }}>
              <div style={{ padding: 20, borderBottom: `1px solid ${theme.accent}40`, display: "flex", justifyContent: "space-between", alignItems: "center", background: theme.accent }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--text-main)" }}>Match Dashboard: {t1?.team_name} vs {t2?.team_name}</h3>
                <button 
                  onClick={() => {
                    setPublicBoxScoreMatch(null);
                    // Remove ?match= from url
                    const url = new URL(window.location.href);
                    url.searchParams.delete('match');
                    window.history.pushState({}, '', url.toString());
                  }} 
                  style={{ background: "rgba(0,0,0,0.2)", border: "none", color: "var(--text-main)", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}
                >
                  ✕
                </button>
              </div>
              <div style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 30 }}>
                {/* Match Info summary */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--panel-bg)", padding: 24, borderRadius: 12 }}>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: "var(--text-main)" }}>{match.score_team1}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-muted)" }}>{t1?.team_name}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: match.status === "live" ? "#ef4444" : "var(--text-main)", textTransform: "uppercase" }}>{match.status}</div>
                    {match.current_period && <div style={{ fontSize: 16, fontWeight: 900, color: "#38bdf8" }}>{match.current_period}</div>}
                    {match.remaining_time && <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text-main)" }}>{match.remaining_time}</div>}
                  </div>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: "var(--text-main)" }}>{match.score_team2}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-muted)" }}>{t2?.team_name}</div>
                  </div>
                </div>

                {match.recent_action && match.status === "live" && (
                  <div style={{ background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.2)", padding: 16, borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
                    <Activity color="#38bdf8" />
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 4 }}>LATEST PLAY</div>
                      <div style={{ fontSize: 16, color: "var(--text-main)", fontWeight: 800 }}>
                        {match.recent_action.player_name} ({match.recent_action.team_id === t1?.team_id ? t1?.team_name : t2?.team_name}) - {match.recent_action.action}
                      </div>
                    </div>
                  </div>
                )}

                {[ { t: t1, p: t1Players }, { t: t2, p: t2Players } ].map(({ t, p }) => (
                  <div key={t?.team_id}>
                    <h4 style={{ margin: "0 0 16px", fontSize: 18, color: theme.accent, display: "flex", alignItems: "center", gap: 8 }}>
                      {t?.logo && <img src={t.logo} style={{width:24, height:24, borderRadius:"50%"}} alt="" />}
                      {t?.team_name} Box Score
                    </h4>
                    <div style={{ overflowX: "auto", background: "rgba(0,0,0,0.2)", borderRadius: 12 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                          <tr style={{ background: "var(--panel-bg)" }}>
                            <th style={{ padding: 12, color: "var(--text-muted)", fontSize: 13, textTransform: "uppercase" }}>Player</th>
                            {sportStats.map(st => <th key={st} style={{ padding: 12, color: "var(--text-muted)", fontSize: 13, textTransform: "uppercase", textAlign: "center" }}>{st.replace("_", " ")}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {p.map(player => (
                            <tr key={player.player_id} style={{ borderBottom: "1px solid var(--panel-bg)" }}>
                              <td style={{ padding: 12, fontWeight: 700, fontSize: 14 }}>{player.player_name} <span style={{ color: "#475569", fontSize: 12, marginLeft: 4 }}>#{player.jersey_number}</span></td>
                              {sportStats.map(st => (
                                <td key={st} style={{ padding: 12, textAlign: "center", fontWeight: 800, color: "var(--text-main)" }}>
                                  {getStat(player.player_id, st)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
