import React, { useState, useEffect } from "react";
import { useDatabase } from "../context/DatabaseContext";
import { useAuth } from "../context/AuthContext";
import { Player, PlayerStat } from "../types";

const QUICK_ACTIONS: Record<string, { label: string, stat: keyof PlayerStat, pts: number, inc: number }[]> = {
  "Basketball": [
    { label: "+1 Pt", stat: "points", pts: 1, inc: 1 },
    { label: "+2 Pts", stat: "points", pts: 2, inc: 2 },
    { label: "+3 Pts", stat: "points", pts: 3, inc: 3 },
    { label: "Reb", stat: "rebounds", pts: 0, inc: 1 },
    { label: "Ast", stat: "assists", pts: 0, inc: 1 },
    { label: "Stl", stat: "steals", pts: 0, inc: 1 },
    { label: "Blk", stat: "blocks", pts: 0, inc: 1 },
    { label: "Foul", stat: "fouls", pts: 0, inc: 1 },
  ],
  "Volleyball": [
    { label: "Kill (+1)", stat: "kills", pts: 1, inc: 1 },
    { label: "Ace (+1)", stat: "aces", pts: 1, inc: 1 },
    { label: "Block (+1)", stat: "blocks", pts: 1, inc: 1 },
    { label: "Dig", stat: "digs", pts: 0, inc: 1 },
    { label: "Ast", stat: "assists", pts: 0, inc: 1 },
    { label: "Foul", stat: "fouls", pts: 0, inc: 1 },
  ],
  "Table Tennis": [
    { label: "Point (+1)", stat: "points", pts: 1, inc: 1 },
    { label: "Ace", stat: "aces", pts: 0, inc: 1 },
    { label: "Smash", stat: "smashes", pts: 0, inc: 1 },
    { label: "Svc Win", stat: "service_wins", pts: 0, inc: 1 },
  ],
  "Badminton": [
    { label: "Point (+1)", stat: "points", pts: 1, inc: 1 },
    { label: "Smash", stat: "smashes", pts: 0, inc: 1 },
    { label: "Drop", stat: "drops", pts: 0, inc: 1 },
    { label: "Clear", stat: "clears", pts: 0, inc: 1 },
  ],
  "Sepak Takraw": [
    { label: "Point (+1)", stat: "points", pts: 1, inc: 1 },
    { label: "Kick", stat: "kicks", pts: 0, inc: 1 },
    { label: "Header", stat: "headers", pts: 0, inc: 1 },
    { label: "Roll", stat: "rolls", pts: 0, inc: 1 },
  ],
  "Arnis": [
    { label: "Point (+1)", stat: "points", pts: 1, inc: 1 },
    { label: "Strike", stat: "strikes", pts: 0, inc: 1 },
    { label: "Block", stat: "blocks", pts: 0, inc: 1 },
    { label: "Disarm", stat: "disarms", pts: 0, inc: 1 },
  ],
  "Taekwondo": [
    { label: "Point (+1)", stat: "points", pts: 1, inc: 1 },
    { label: "Kick", stat: "kicks", pts: 0, inc: 1 },
    { label: "Punch", stat: "punches", pts: 0, inc: 1 },
    { label: "Knockdown", stat: "knockdowns", pts: 0, inc: 1 },
  ],
};

export default function LiveMatchControlModal({ matchId, onClose }: { matchId: number, onClose: () => void }) {
  const { db, updateMatchScore, updateMatchDetails, updatePlayerStat, addActivityLog, updateMatchLiveState, updateMatchStatus } = useDatabase();
  const { user } = useAuth();
  
  const match = db.matches.find(m => m.match_id === matchId);
  if (!match) return null;

  const t1 = db.teams.find(t => t.team_id === match.team1_id);
  const t2 = db.teams.find(t => t.team_id === match.team2_id);
  
  const t1Players = db.players.filter(p => p.team_id === match.team1_id);
  const t2Players = db.players.filter(p => p.team_id === match.team2_id);

  const actions = QUICK_ACTIONS[match.sport] || [{ label: "+1 Point", stat: "points", pts: 1, inc: 1 }];

  const handleQuickAction = (player: Player, action: any, isTeam1: boolean) => {
    // Update player stat
    updatePlayerStat(match.match_id, player.player_id, match.sport, action.stat as any, action.inc);
    
    // Update match score if points are involved
    if (action.pts > 0) {
      if (isTeam1) {
        updateMatchScore(match.match_id, match.score_team1 + action.pts, match.score_team2);
      } else {
        updateMatchScore(match.match_id, match.score_team1, match.score_team2 + action.pts);
      }
    }
    
    updateMatchLiveState(match.match_id, {
      recent_action: {
        player_name: player.player_name,
        action: action.label,
        team_id: isTeam1 ? t1!.team_id : t2!.team_id,
        timestamp: new Date().toISOString()
      }
    });

    addActivityLog(`${user?.name} recorded ${action.label} for ${player.player_name} (${isTeam1 ? t1?.team_name : t2?.team_name})`);
  };

  const [period, setPeriod] = useState(match.current_period || "");
  const [time, setTime] = useState(match.remaining_time || "");

  useEffect(() => {
    let interval: any;
    if (match.clock_status === "running" && match.last_clock_update !== undefined && match.remaining_seconds !== undefined) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - match.last_clock_update!) / 1000);
        let currentRemaining = match.remaining_seconds! - elapsed;
        if (currentRemaining < 0) currentRemaining = 0;
        
        const m = Math.floor(currentRemaining / 60);
        const s = currentRemaining % 60;
        setTime(`${m}:${s.toString().padStart(2, "0")}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [match.clock_status, match.last_clock_update, match.remaining_seconds]);

  const handleUpdateClock = () => {
    updateMatchDetails(match.match_id, match.venue || "", match.referee || "", period, time);
    
    const parts = time.split(":");
    let secs = 0;
    if (parts.length === 2) {
      secs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else {
      secs = parseInt(time) || 0;
    }

    updateMatchLiveState(match.match_id, {
      remaining_time: time,
      remaining_seconds: secs,
      last_clock_update: Date.now()
    });

    addActivityLog(`${user?.name} updated clock for match #${match.match_id} to ${period} ${time}`);
  };

  const toggleTimer = () => {
    if (match.clock_status === "running") {
      updateMatchLiveState(match.match_id, { clock_status: "paused" });
    } else {
      if (match.status !== "live") {
        updateMatchStatus(match.match_id, "live");
      }
      const parts = time.split(":");
      let secs = 0;
      if (parts.length === 2) {
        secs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      } else {
        secs = parseInt(time) || 0;
      }
      updateMatchLiveState(match.match_id, {
        clock_status: "running",
        last_clock_update: Date.now(),
        remaining_seconds: secs,
        remaining_time: time
      });
    }
  };

  const handleTimeout = (isTeam1: boolean) => {
    let t1outs = match.timeouts_team1 || 0;
    let t2outs = match.timeouts_team2 || 0;
    
    if (isTeam1) {
      t1outs += 1;
    } else {
      t2outs += 1;
    }

    // Pause timer if running
    updateMatchLiveState(match.match_id, {
      timeouts_team1: t1outs,
      timeouts_team2: t2outs,
      clock_status: "paused",
      recent_action: {
        player_name: "TEAM",
        action: "TIMEOUT",
        team_id: isTeam1 ? t1!.team_id : t2!.team_id,
        timestamp: new Date().toISOString()
      }
    });

    addActivityLog(`${user?.name} recorded a TIMEOUT for ${isTeam1 ? t1?.team_name : t2?.team_name}`);
  };

  const handleAdjustTimeout = (isTeam1: boolean, amount: number) => {
    let t1outs = match.timeouts_team1 || 0;
    let t2outs = match.timeouts_team2 || 0;
    if (isTeam1) t1outs = Math.max(0, t1outs + amount);
    else t2outs = Math.max(0, t2outs + amount);
    
    updateMatchLiveState(match.match_id, {
      timeouts_team1: t1outs,
      timeouts_team2: t2outs,
    });
  };

  const handleEndMatch = () => {
    if (window.confirm("Are you sure you want to end this match?")) {
      updateMatchLiveState(match.match_id, { clock_status: "paused" });
      updateMatchStatus(match.match_id, "completed");
      onClose();
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: 20, background: "var(--panel-bg)", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--text-main)", fontSize: 24, fontWeight: 900 }}>LIVE CONTROL: {match.sport}</h2>
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{t1?.team_name} vs {t2?.team_name}</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleEndMatch} style={{ background: "#ef4444", border: "none", color: "var(--text-main)", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 900 }}>END MATCH</button>
          <button onClick={onClose} style={{ background: "var(--border-color)", border: "none", color: "var(--text-main)", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 800 }}>CLOSE</button>
        </div>
      </div>

      {/* Scoreboard & Clock */}
      <div style={{ display: "flex", justifyContent: "center", gap: 40, padding: 40, background: "var(--bg)", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#38bdf8", marginBottom: 12 }}>{t1?.team_name}</div>
          <div style={{ fontSize: 120, fontWeight: 900, color: "var(--text-main)", lineHeight: 1 }}>{match.score_team1}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <span style={{ color: "#f59e0b", fontSize: 18, fontWeight: 900 }}>Timeouts: {match.timeouts_team1 || 0}</span>
            <button onClick={() => handleTimeout(true)} style={{ background: "#f59e0b", color: "var(--bg)", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 900, cursor: "pointer", fontSize: 14 }}>CALL TIMEOUT</button>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => handleAdjustTimeout(true, 1)} style={{ background: "var(--border-color)", color: "var(--text-main)", border: "none", width: 32, height: 32, borderRadius: 6, cursor: "pointer", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              <button onClick={() => handleAdjustTimeout(true, -1)} style={{ background: "var(--border-color)", color: "var(--text-main)", border: "none", width: 32, height: 32, borderRadius: 6, cursor: "pointer", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
            </div>
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center", gap: 16, padding: "0 20px" }}>
          <div style={{ display: "flex", gap: 16 }}>
            <input type="text" value={period} onChange={e => setPeriod(e.target.value)} placeholder="Period (e.g. Q1)" style={{ width: 140, background: "var(--panel-bg)", border: "2px solid #38bdf8", color: "var(--text-main)", padding: "16px", borderRadius: 12, textAlign: "center", fontWeight: 900, fontSize: 20 }} />
            <input type="text" value={time} onChange={e => setTime(e.target.value)} placeholder="10:00" style={{ width: 140, background: "var(--panel-bg)", border: "2px solid #38bdf8", color: "var(--text-main)", padding: "16px", borderRadius: 12, textAlign: "center", fontWeight: 900, fontFamily: "monospace", fontSize: 24 }} />
          </div>
          <div style={{ display: "flex", gap: 16, width: "100%" }}>
            <button onClick={toggleTimer} style={{ flex: 1, background: match.clock_status === "running" ? "#ef4444" : "#10b981", color: "var(--text-main)", border: "none", padding: "16px", borderRadius: 12, fontWeight: 900, cursor: "pointer", fontSize: 18, boxShadow: "0 4px 6px rgba(0,0,0,0.5)" }}>
              {match.clock_status === "running" ? "PAUSE" : "START"} TIMER
            </button>
            <button onClick={handleUpdateClock} style={{ flex: 1, background: "#38bdf8", color: "var(--bg)", border: "none", padding: "16px", borderRadius: 12, fontWeight: 900, cursor: "pointer", fontSize: 18, boxShadow: "0 4px 6px rgba(0,0,0,0.5)" }}>UPDATE SETTINGS</button>
          </div>
        </div>

        <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#38bdf8", marginBottom: 12 }}>{t2?.team_name}</div>
          <div style={{ fontSize: 120, fontWeight: 900, color: "var(--text-main)", lineHeight: 1 }}>{match.score_team2}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => handleAdjustTimeout(false, -1)} style={{ background: "var(--border-color)", color: "var(--text-main)", border: "none", width: 32, height: 32, borderRadius: 6, cursor: "pointer", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
              <button onClick={() => handleAdjustTimeout(false, 1)} style={{ background: "var(--border-color)", color: "var(--text-main)", border: "none", width: 32, height: 32, borderRadius: 6, cursor: "pointer", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
            <button onClick={() => handleTimeout(false)} style={{ background: "#f59e0b", color: "var(--bg)", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 900, cursor: "pointer", fontSize: 14 }}>CALL TIMEOUT</button>
            <span style={{ color: "#f59e0b", fontSize: 18, fontWeight: 900 }}>Timeouts: {match.timeouts_team2 || 0}</span>
          </div>
        </div>
      </div>

      {/* Players & Actions */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", flexDirection: window.innerWidth < 768 ? "column" : "row" }}>
        {/* Team 1 Panel */}
        <div style={{ flex: 1, borderRight: window.innerWidth < 768 ? "none" : "1px solid var(--border-color)", borderBottom: window.innerWidth < 768 ? "1px solid var(--border-color)" : "none", overflowY: "auto", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            {t1?.logo && <img src={t1.logo} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />}
            <h3 style={{ color: "var(--text-main)", margin: 0, fontSize: 24, fontWeight: 900 }}>{t1?.team_name}</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            {t1Players.map(p => (
              <div key={p.player_id} style={{ background: "linear-gradient(90deg, var(--panel-bg) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid var(--border-color)", padding: 20, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div style={{ color: "var(--text-main)", fontWeight: 900, fontSize: 20, minWidth: 120 }}>
                  <span style={{ color: "#38bdf8", marginRight: 8 }}>#{p.jersey_number}</span>
                  {p.player_name}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {actions.map(a => (
                    <button key={a.label} onClick={() => handleQuickAction(p, a, true)} style={{ background: a.stat === "fouls" ? "#ef4444" : a.pts > 0 ? "#10b981" : "#1e40af", color: "var(--text-main)", border: "none", padding: "14px 20px", borderRadius: 12, fontSize: 16, fontWeight: 900, cursor: "pointer", transition: "all 0.1s", minWidth: 70, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)" }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.90)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {t1Players.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 18 }}>No players found. Please add players in Dashboard.</div>}
          </div>
        </div>

        {/* Team 2 Panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            {t2?.logo && <img src={t2.logo} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />}
            <h3 style={{ color: "var(--text-main)", margin: 0, fontSize: 24, fontWeight: 900 }}>{t2?.team_name}</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            {t2Players.map(p => (
              <div key={p.player_id} style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.02) 0%, var(--panel-bg) 100%)", border: "1px solid var(--border-color)", padding: 20, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div style={{ color: "var(--text-main)", fontWeight: 900, fontSize: 20, minWidth: 120 }}>
                  <span style={{ color: "#38bdf8", marginRight: 8 }}>#{p.jersey_number}</span>
                  {p.player_name}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {actions.map(a => (
                    <button key={a.label} onClick={() => handleQuickAction(p, a, false)} style={{ background: a.stat === "fouls" ? "#ef4444" : a.pts > 0 ? "#10b981" : "#1e40af", color: "var(--text-main)", border: "none", padding: "14px 20px", borderRadius: 12, fontSize: 16, fontWeight: 900, cursor: "pointer", transition: "all 0.1s", minWidth: 70, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)" }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.90)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {t2Players.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 18 }}>No players found. Please add players in Dashboard.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}