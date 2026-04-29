import React, { useState } from "react";
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
  const { db, updateMatchScore, updateMatchDetails, updatePlayerStat, addActivityLog } = useDatabase();
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
    
    addActivityLog(`${user?.name} recorded ${action.label} for ${player.player_name} (${isTeam1 ? t1?.team_name : t2?.team_name})`);
  };

  const [period, setPeriod] = useState(match.current_period || "");
  const [time, setTime] = useState(match.remaining_time || "");

  const handleUpdateClock = () => {
    updateMatchDetails(match.match_id, match.venue || "", match.referee || "", period, time);
    addActivityLog(`${user?.name} updated clock for match #${match.match_id} to ${period} ${time}`);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: 20, background: "#0f172a", borderBottom: "1px solid #1e3a5f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, color: "#fff", fontSize: 24, fontWeight: 900 }}>LIVE CONTROL: {match.sport}</h2>
          <div style={{ color: "#94a3b8", fontSize: 14 }}>{t1?.team_name} vs {t2?.team_name}</div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 800 }}>CLOSE</button>
      </div>

      {/* Scoreboard & Clock */}
      <div style={{ display: "flex", justifyContent: "center", gap: 40, padding: 30, background: "#020917", borderBottom: "1px solid #1e3a5f" }}>
        <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#38bdf8", marginBottom: 10 }}>{t1?.team_name}</div>
          <div style={{ fontSize: 80, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{match.score_team1}</div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "0 40px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input type="text" value={period} onChange={e => setPeriod(e.target.value)} placeholder="Period (e.g. Q1)" style={{ width: 120, background: "#0f172a", border: "1px solid #1e3a5f", color: "#fff", padding: 12, borderRadius: 8, textAlign: "center", fontWeight: 800, fontSize: 16 }} />
            <input type="text" value={time} onChange={e => setTime(e.target.value)} placeholder="Time (e.g. 10:00)" style={{ width: 120, background: "#0f172a", border: "1px solid #1e3a5f", color: "#fff", padding: 12, borderRadius: 8, textAlign: "center", fontWeight: 800, fontFamily: "monospace", fontSize: 16 }} />
          </div>
          <button onClick={handleUpdateClock} style={{ background: "#38bdf8", color: "#020917", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 800, cursor: "pointer", width: "100%", fontSize: 14 }}>UPDATE CLOCK</button>
        </div>

        <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#38bdf8", marginBottom: 10 }}>{t2?.team_name}</div>
          <div style={{ fontSize: 80, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{match.score_team2}</div>
        </div>
      </div>

      {/* Players & Actions */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", flexDirection: window.innerWidth < 768 ? "column" : "row" }}>
        {/* Team 1 Panel */}
        <div style={{ flex: 1, borderRight: window.innerWidth < 768 ? "none" : "1px solid #1e3a5f", borderBottom: window.innerWidth < 768 ? "1px solid #1e3a5f" : "none", overflowY: "auto", padding: 20 }}>
          <h3 style={{ color: "#fff", marginTop: 0, marginBottom: 20, fontSize: 20, fontWeight: 800 }}>{t1?.team_name} Roster</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {t1Players.map(p => (
              <div key={p.player_id} style={{ background: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
                  <span style={{ color: "#94a3b8", marginRight: 8 }}>#{p.jersey_number}</span>
                  {p.player_name}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
                  {actions.map(a => (
                    <button key={a.label} onClick={() => handleQuickAction(p, a, true)} style={{ background: a.stat === "fouls" ? "rgba(239,68,68,0.8)" : a.pts > 0 ? "#10b981" : "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6, fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "transform 0.1s" }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {t1Players.length === 0 && <div style={{ color: "#94a3b8" }}>No players found.</div>}
          </div>
        </div>

        {/* Team 2 Panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <h3 style={{ color: "#fff", marginTop: 0, marginBottom: 20, fontSize: 20, fontWeight: 800 }}>{t2?.team_name} Roster</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {t2Players.map(p => (
              <div key={p.player_id} style={{ background: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
                  <span style={{ color: "#94a3b8", marginRight: 8 }}>#{p.jersey_number}</span>
                  {p.player_name}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
                  {actions.map(a => (
                    <button key={a.label} onClick={() => handleQuickAction(p, a, false)} style={{ background: a.stat === "fouls" ? "rgba(239,68,68,0.8)" : a.pts > 0 ? "#10b981" : "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6, fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "transform 0.1s" }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {t2Players.length === 0 && <div style={{ color: "#94a3b8" }}>No players found.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}