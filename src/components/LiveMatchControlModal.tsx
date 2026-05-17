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
    { label: "Point", stat: "points", pts: 1, inc: 1 },
    { label: "Kill", stat: "kills", pts: 0, inc: 1 },
    { label: "Ace", stat: "aces", pts: 0, inc: 1 },
    { label: "Block", stat: "blocks", pts: 0, inc: 1 },
    { label: "Error", stat: "errors", pts: 0, inc: 1 },
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
    { label: "Gam-jeom", stat: "gam_jeom", pts: 0, inc: 1 },
  ],
};

export default function LiveMatchControlModal({ matchId, onClose }: { matchId: number, onClose: () => void }) {
  const { db, updateMatchScore, updateMatchDetails, updatePlayerStat, addActivityLog, updateMatchLiveState, updateMatchStatus } = useDatabase();
  const { user } = useAuth();
  
  const match = db.matches.find(m => m.match_id === matchId);
  if (!match) return null;

  const t1 = db.teams.find(t => t.team_id === match.team1_id);
  const t2 = db.teams.find(t => t.team_id === match.team2_id);
  
  const isMens = match.category === "Men's Division";
  const isWomens = match.category === "Women's Division";

  const t1Players = db.players.filter(p => p.team_id === match.team1_id && (!isMens || p.gender === "Male") && (!isWomens || p.gender === "Female"));
  const t2Players = db.players.filter(p => p.team_id === match.team2_id && (!isMens || p.gender === "Male") && (!isWomens || p.gender === "Female"));

  const actions = QUICK_ACTIONS[match.sport] || [{ label: "+1 Point", stat: "points", pts: 1, inc: 1 }];

  const handleQuickAction = (player: Player, action: any, isTeam1: boolean) => {
    // Update player stat
    updatePlayerStat(match.match_id, player.player_id, match.sport, action.stat as any, action.inc);
    
    // Check for special Gam-jeom rule (Taekwondo)
    let extraPointsT1 = 0;
    let extraPointsT2 = 0;
    if (action.stat === "gam_jeom" && match.sport === "Taekwondo") {
      // Gam-jeom on Player A automatically grants 1 point to Player B
      if (isTeam1) extraPointsT2 += 1;
      else extraPointsT1 += 1;
    }

    // Update match score if points are involved
    if (action.pts > 0 || extraPointsT1 > 0 || extraPointsT2 > 0) {
      let newS1 = match.score_team1 + (isTeam1 ? action.pts : 0) + extraPointsT1;
      let newS2 = match.score_team2 + (!isTeam1 ? action.pts : 0) + extraPointsT2;
      
      let t1_rounds = match.t1_rounds || 0;
      let t2_rounds = match.t2_rounds || 0;
      let checkRoundWin = false;
      let checkMatchWin = false;

      // Rules mapping
      let targetScore = 0;
      let winByTwo = false;
      let maxRoundsToWin = 1;

      if (match.sport === 'Volleyball') {
        targetScore = 25; // Simple version: normally 3rd set might be 15, but let's stick to 25
        if (t1_rounds + t2_rounds === 2) targetScore = 15; // 3rd set
        winByTwo = true;
        maxRoundsToWin = 2; // Best of 3
      } else if (match.sport === 'Table Tennis') {
        targetScore = 11;
        winByTwo = true;
        maxRoundsToWin = 2;
      } else if (match.sport === 'Badminton' || match.sport === 'Sepak Takraw') {
        targetScore = 21;
        winByTwo = true;
        maxRoundsToWin = 2;
      } else if (match.sport === 'Arnis') {
        targetScore = 5;
        winByTwo = false;
        maxRoundsToWin = 2;
      } else if (match.sport === 'Taekwondo') {
        targetScore = 12; // Sample target gap/score for TKD
        winByTwo = false;
        maxRoundsToWin = 2;
      }

      if (targetScore > 0) {
        if (winByTwo) {
           if ((newS1 >= targetScore && newS1 - newS2 >= 2) || (newS2 >= targetScore && newS2 - newS1 >= 2)) {
               checkRoundWin = true;
           }
        } else {
           if (newS1 >= targetScore || newS2 >= targetScore) {
               checkRoundWin = true;
           }
        }
      }

      if (checkRoundWin) {
         if (newS1 > newS2) t1_rounds += 1;
         else if (newS2 > newS1) t2_rounds += 1;
         
         addActivityLog(`${match.sport} Set/Round Won by ${newS1 > newS2 ? t1?.team_name : t2?.team_name}!`);
         newS1 = 0;
         newS2 = 0;
         
         if (t1_rounds >= maxRoundsToWin || t2_rounds >= maxRoundsToWin) {
             checkMatchWin = true;
         }
      }

      updateMatchScore(match.match_id, newS1, newS2);
      
      if (targetScore > 0) { 
         updateMatchLiveState(match.match_id, { t1_rounds, t2_rounds });
      }

      if (checkMatchWin) {
         updateMatchLiveState(match.match_id, { clock_status: "paused" });
         updateMatchStatus(match.match_id, "completed", t1_rounds >= maxRoundsToWin ? t1?.team_name : t2?.team_name);
         addActivityLog(`${match.sport} Match Won by ${t1_rounds >= maxRoundsToWin ? t1?.team_name : t2?.team_name}!`);
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
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#f8fafc", zIndex: 2000, display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
      {/* Top Black Bar */}
      <div style={{ background: "#18181b", padding: "16px 24px", color: "white", fontSize: "20px", fontWeight: "500", letterSpacing: "0.5px" }}>
        Live Match Controller
      </div>

      {/* Header section */}
      <div style={{ background: "#ffffff", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "20px", color: "#64748b" }}>✕</button>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#2563eb", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>{match.category} {match.sport}</span>
            <span style={{ color: "#64748b", fontSize: "11px", marginTop: "4px" }}>{match.game_label} - Match #{match.match_id}</span>
          </div>
        </div>

        <div style={{ background: "#0f172a", borderRadius: "100px", padding: "8px 24px", display: "flex", alignItems: "center", gap: "16px", color: "#fcd34d", fontWeight: "700", fontSize: "16px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Period</span>
            <input type="text" value={period} onChange={e => setPeriod(e.target.value)} style={{ background: "transparent", border: "none", color: "#fcd34d", width: "30px", fontSize: "18px", fontWeight: "700", padding: 0, textAlign: "center" }} />
          </div>
          <div style={{ width: "1px", height: "16px", background: "#334155" }} />
          <input type="text" value={time} onChange={e => setTime(e.target.value)} onBlur={handleUpdateClock} style={{ background: "transparent", border: "none", color: "#fcd34d", width: "60px", fontSize: "22px", fontWeight: "700", padding: 0, textAlign: "center", fontFamily: "monospace" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={toggleTimer} style={{ background: "white", border: "1px solid #e2e8f0", color: "#475569", padding: "8px 16px", borderRadius: "100px", fontWeight: "600", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#f1f5f9"} onMouseOut={e => e.currentTarget.style.background = "white"}>
             {match.clock_status === "running" ? "⏸ PAUSE CLOCK" : "▶ START CLOCK"}
          </button>
          <button onClick={handleEndMatch} style={{ background: "#ef4444", border: "none", color: "white", padding: "8px 24px", borderRadius: "100px", fontWeight: "600", fontSize: "12px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)" }} onMouseOver={e => e.currentTarget.style.background = "#dc2626"} onMouseOut={e => e.currentTarget.style.background = "#ef4444"}>
            END MATCH
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: "32px 48px", overflowY: "auto" }}>
        
        {/* Score & Middle Section */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <span style={{ fontSize: "18px", fontWeight: "500", color: "#0f172a", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>{t1?.team_name}</span>
            <div style={{ 
              background: "white", 
              borderRadius: "20px", 
              padding: "24px 32px", 
              boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.1), 0 8px 10px -6px rgba(37, 99, 235, 0.1)",
              border: "1px solid #bfdbfe",
              minWidth: "120px",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "64px", fontWeight: "600", color: "#2563eb", lineHeight: 1 }}>{match.score_team1}</span>
            </div>
            <div style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", marginTop: "32px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", width: "100%" }}>HOME ROSTER</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: "0 0 200px" }}>
            {/* Sets/Rounds Area */}
            {(match.sport !== "Basketball") && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px" }}>
                <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600", letterSpacing: "1px", marginBottom: "8px" }}>SETS / ROUNDS</span>
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <span style={{ fontSize: "48px", fontWeight: "800", color: "#0f172a" }}>{match.t1_rounds || 0}</span>
                  <span style={{ fontSize: "24px", color: "#cbd5e1" }}>-</span>
                  <span style={{ fontSize: "48px", fontWeight: "800", color: "#0f172a" }}>{match.t2_rounds || 0}</span>
                </div>
              </div>
            )}
            
            {/* Center Area, could be timeouts or status */}
             <div style={{ color: "#64748b", fontSize: "14px", fontWeight: "600", display: "flex", gap: "24px", marginTop: (match.sport !== "Basketball") ? "0px" : "80px" }}>
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => handleAdjustTimeout(true, -1)} style={{ cursor: "pointer", border: "none", background: "transparent", fontSize: "16px" }}>-</button>
                  <span style={{ fontSize: "20px", color: "#1e293b", fontWeight: "700" }}>{match.timeouts_team1 || 0}</span>
                  <button onClick={() => handleAdjustTimeout(true, 1)} style={{ cursor: "pointer", border: "none", background: "transparent", fontSize: "16px" }}>+</button>
                 </div>
                 <button onClick={() => handleTimeout(true)} style={{ marginTop: 4, background: "#f1f5f9", border: "none", color: "#475569", borderRadius: "100px", fontSize: "10px", padding: "4px 8px", cursor: "pointer" }}>CALL TIMEOUT</button>
               </div>
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.3, justifyContent: "center" }}>
                 <span style={{ fontSize: "12px" }}>TIMEOUTS</span>
               </div>
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => handleAdjustTimeout(false, -1)} style={{ cursor: "pointer", border: "none", background: "transparent", fontSize: "16px" }}>-</button>
                  <span style={{ fontSize: "20px", color: "#1e293b", fontWeight: "700" }}>{match.timeouts_team2 || 0}</span>
                  <button onClick={() => handleAdjustTimeout(false, 1)} style={{ cursor: "pointer", border: "none", background: "transparent", fontSize: "16px" }}>+</button>
                 </div>
                 <button onClick={() => handleTimeout(false)} style={{ marginTop: 4, background: "#f1f5f9", border: "none", color: "#475569", borderRadius: "100px", fontSize: "10px", padding: "4px 8px", cursor: "pointer" }}>CALL TIMEOUT</button>
               </div>
             </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <span style={{ fontSize: "18px", fontWeight: "500", color: "#0f172a", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>{t2?.team_name}</span>
            <div style={{ 
              background: "white", 
              borderRadius: "20px", 
              padding: "24px 32px", 
              boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.1), 0 8px 10px -6px rgba(37, 99, 235, 0.1)",
              border: "1px solid #bfdbfe",
              minWidth: "120px",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "64px", fontWeight: "600", color: "#2563eb", lineHeight: 1 }}>{match.score_team2}</span>
            </div>
            <div style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", marginTop: "32px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", width: "100%", textAlign: "right" }}>AWAY ROSTER</div>
          </div>
        </div>

        {/* Player Roster Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px" }}>
          
          {/* Team 1 Players */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {t1Players.map(p => {
              const pStats = db.playerStats.find(s => s.player_id === p.player_id && s.match_id === match.match_id);
              return (
              <div key={p.player_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", padding: "10px 16px", borderRadius: "100px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4", color: "#2563eb", fontWeight: "600", borderRadius: "8px", fontSize: "12px", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                    {p.jersey_number.toString().padStart(2, '0')}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "#1e293b", fontWeight: "500", fontSize: "13px" }}>{p.player_name}</span>
                    <span style={{ color: "#94a3b8", fontSize: "10px", fontWeight: "500", marginTop: "2px" }}>PTS {pStats?.points || 0} &nbsp; FLS {pStats?.fouls || 0}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {actions.map(a => {
                    const isFoul = a.stat === "fouls" || a.stat === "errors" || a.stat === "gam_jeom";
                    const isReb = a.label === "Reb" || a.label === "Ast" || a.label === "Stl" || a.label === "Blk";
                    const shortLabel = a.label.replace(" Pts", "").replace(" Pt", "").replace("Point (+1)", "+1");
                    
                    return (
                      <button key={a.label} onClick={() => handleQuickAction(p, a, true)} style={{ 
                        background: isFoul ? "#fef2f2" : (isReb ? "#f8fafc" : "#2563eb"), 
                        color: isFoul ? "#ef4444" : (isReb ? "#64748b" : "white"), 
                        border: isReb ? "1px solid #e2e8f0" : "none", 
                        padding: isReb ? "5px 6px" : "6px 12px", 
                        borderRadius: "100px", 
                        fontSize: isReb ? "10px" : "12px", 
                        fontWeight: "600", 
                        cursor: "pointer",
                        minWidth: isReb ? "auto" : "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.1s"
                      }}
                      onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"} 
                      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"} 
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                        {isFoul ? "⚠" : shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )})}
            {t1Players.length === 0 && <div style={{ color: "#64748b", fontSize: "14px", textAlign: "center", padding: "24px" }}>No players found</div>}
          </div>

          {/* Team 2 Players */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {t2Players.map(p => {
              const pStats = db.playerStats.find(s => s.player_id === p.player_id && s.match_id === match.match_id);
              return (
              <div key={p.player_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", padding: "10px 16px", borderRadius: "100px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4", color: "#2563eb", fontWeight: "600", borderRadius: "8px", fontSize: "12px", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                    {p.jersey_number.toString().padStart(2, '0')}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "#1e293b", fontWeight: "500", fontSize: "13px" }}>{p.player_name}</span>
                    <span style={{ color: "#94a3b8", fontSize: "10px", fontWeight: "500", marginTop: "2px" }}>PTS {pStats?.points || 0} &nbsp; FLS {pStats?.fouls || 0}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {actions.map(a => {
                    const isFoul = a.stat === "fouls" || a.stat === "errors" || a.stat === "gam_jeom";
                    const isReb = a.label === "Reb" || a.label === "Ast" || a.label === "Stl" || a.label === "Blk";
                    const shortLabel = a.label.replace(" Pts", "").replace(" Pt", "").replace("Point (+1)", "+1");
                    
                    return (
                      <button key={a.label} onClick={() => handleQuickAction(p, a, false)} style={{ 
                        background: isFoul ? "#fef2f2" : (isReb ? "#f8fafc" : "#2563eb"), 
                        color: isFoul ? "#ef4444" : (isReb ? "#64748b" : "white"), 
                        border: isReb ? "1px solid #e2e8f0" : "none", 
                        padding: isReb ? "5px 6px" : "6px 12px", 
                        borderRadius: "100px", 
                        fontSize: isReb ? "10px" : "12px", 
                        fontWeight: "600", 
                        cursor: "pointer",
                        minWidth: isReb ? "auto" : "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.1s"
                      }}
                      onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"} 
                      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"} 
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                        {isFoul ? "⚠" : shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )})}
            {t2Players.length === 0 && <div style={{ color: "#64748b", fontSize: "14px", textAlign: "center", padding: "24px" }}>No players found</div>}
          </div>
          
        </div>
      </div>

      {/* Bottom Footer Area */}
      <div style={{ background: "white", padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <button style={{ background: "#ec4899", color: "white", padding: "8px 24px", borderRadius: "100px", fontWeight: "600", border: "none", fontSize: "11px", cursor: "pointer", display: "flex", gap: "8px", alignItems: "center", letterSpacing: "0.5px" }}>
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
               UNDO LAST ACTION
            </button>
            <div style={{ background: "#f8fafc", padding: "8px 16px", borderRadius: "100px", fontSize: "11px", fontWeight: "600", color: "#475569", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ width: 6, height: 6, background: "#1e293b", borderRadius: "50%" }}></span>
              {match.clock_status === "paused" ? "MATCH PAUSED" : "CLOCK RUNNING"}
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "8px 16px", borderRadius: "100px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: 6, height: 6, background: "#16a34a", borderRadius: "50%" }}></span>
              LIVE BROADCAST ACTIVE
            </div>
            <button style={{ background: "transparent", color: "#3b82f6", padding: "8px 16px", fontSize: "11px", fontWeight: "600", border: "none", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", letterSpacing: "0.5px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              VIEW ACTIVITY LOG
            </button>
          </div>
      </div>

    </div>
  );
}