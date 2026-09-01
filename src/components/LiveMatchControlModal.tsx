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
    { label: "Point (+1)", stat: "points", pts: 1, inc: 1 },
    { label: "Kill (+1)", stat: "kills", pts: 1, inc: 1 },
    { label: "Ace (+1)", stat: "aces", pts: 1, inc: 1 },
    { label: "Block (+1)", stat: "blocks", pts: 1, inc: 1 },
    { label: "Dig", stat: "digs", pts: 0, inc: 1 },
    { label: "Error", stat: "errors", pts: 0, inc: 1 },
  ],
  "Table Tennis": [
    { label: "Point (+1)", stat: "points", pts: 1, inc: 1 },
    { label: "Ace (+1)", stat: "aces", pts: 1, inc: 1 },
    { label: "Smash (+1)", stat: "smashes", pts: 1, inc: 1 },
    { label: "Svc Win", stat: "service_wins", pts: 1, inc: 1 },
    { label: "Error", stat: "errors", pts: 0, inc: 1 },
  ],
  "Badminton": [
    { label: "Point (+1)", stat: "points", pts: 1, inc: 1 },
    { label: "Smash (+1)", stat: "smashes", pts: 1, inc: 1 },
    { label: "Drop (+1)", stat: "drops", pts: 1, inc: 1 },
    { label: "Clear (+1)", stat: "clears", pts: 1, inc: 1 },
    { label: "Fault", stat: "errors", pts: 0, inc: 1 },
  ],
  "Sepak Takraw": [
    { label: "Point (+1)", stat: "points", pts: 1, inc: 1 },
    { label: "Spike (+1)", stat: "kicks", pts: 1, inc: 1 },
    { label: "Header (+1)", stat: "headers", pts: 1, inc: 1 },
    { label: "Roll (+1)", stat: "rolls", pts: 1, inc: 1 },
    { label: "Fault", stat: "errors", pts: 0, inc: 1 },
  ],
  "Arnis": [
    { label: "Point (+1)", stat: "points", pts: 1, inc: 1 },
    { label: "Strike (+1)", stat: "strikes", pts: 1, inc: 1 },
    { label: "Block", stat: "blocks", pts: 0, inc: 1 },
    { label: "Disarm (+2)", stat: "disarms", pts: 2, inc: 1 },
    { label: "Foul", stat: "fouls", pts: 0, inc: 1 },
  ],
  "Taekwondo": [
    { label: "Point (+1)", stat: "points", pts: 1, inc: 1 },
    { label: "Punch (+1)", stat: "punches", pts: 1, inc: 1 },
    { label: "Body Kick (+2)", stat: "kicks", pts: 2, inc: 1 },
    { label: "Head Kick (+3)", stat: "kicks", pts: 3, inc: 1 },
    { label: "Gam-jeom", stat: "gam_jeom", pts: 0, inc: 1 },
  ],
};

export default function LiveMatchControlModal({ matchId, onClose }: { matchId: number, onClose: () => void }) {
  const { db, updateMatchDetails, recordLiveGameAction, addActivityLog, updateMatchLiveState, updateMatchStatus } = useDatabase();
  const { user } = useAuth();
  
  const match = db.matches.find(m => m.match_id === matchId);
  const [period, setPeriod] = useState(match?.current_period || "");
  const [time, setTime] = useState(match?.remaining_time || "");
  const [referee, setReferee] = useState(match?.referee || "");
  
  // Keep local period, time, and referee in sync with match changes
  useEffect(() => {
    if (match?.current_period !== undefined) {
      setPeriod(match.current_period);
    }
  }, [match?.current_period]);

  useEffect(() => {
    if (match?.referee !== undefined) {
      setReferee(match.referee);
    }
  }, [match?.referee]);

  useEffect(() => {
    if (match?.clock_status !== "running" && match?.remaining_time !== undefined) {
      setTime(match.remaining_time);
    }
  }, [match?.remaining_time, match?.clock_status]);

  // Track actions for undo
  const [actionHistory, setActionHistory] = useState<any[]>([]);
  const [showActivityLog, setShowActivityLog] = useState(false);

  const [activePlayers, setActivePlayers] = useState<Set<number>>(() => {
    if (match?.active_player_ids && match.active_player_ids.length > 0) {
      return new Set(match.active_player_ids);
    }
    return new Set();
  });
  const [subToast, setSubToast] = useState<string | null>(null);
  const [pendingSubOut, setPendingSubOut] = useState<Player | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);

  // Sync active players if updated from match object
  useEffect(() => {
    if (match?.active_player_ids && match.active_player_ids.length > 0) {
      setActivePlayers(new Set(match.active_player_ids));
    }
  }, [match?.active_player_ids]);

  const showToast = (msg: string) => {
    setSubToast(msg);
    setTimeout(() => setSubToast(null), 4000);
  };

  const handleToggleActive = (p: Player) => {
    const isAct = activePlayers.has(p.player_id);
    const newSet = new Set(activePlayers);
    const isTeam1 = p.team_id === match.team1_id;
    const teamName = isTeam1 ? t1?.team_name : t2?.team_name;
    let logMsg = "";
    let actionLabel = "";

    if (isAct) {
      newSet.delete(p.player_id);
      setPendingSubOut(p);
      setTimeout(() => {
        setPendingSubOut(curr => curr?.player_id === p.player_id ? null : curr);
      }, 10000);
      showToast(`${p.player_name} subbed out (${teamName})`);
      logMsg = `${p.player_name} subbed out (${teamName})`;
      actionLabel = `Subbed Out`;
    } else {
      newSet.add(p.player_id);
      if (pendingSubOut && pendingSubOut.team_id === p.team_id) {
        logMsg = `${p.player_name} subbed in for ${pendingSubOut.player_name} (${teamName})`;
        actionLabel = `Subbed in for ${pendingSubOut.player_name}`;
        showToast(`${p.player_name} subbed in for ${pendingSubOut.player_name}`);
        setPendingSubOut(null);
      } else {
        logMsg = `${p.player_name} checked into game (${teamName})`;
        actionLabel = `Checked into game`;
        showToast(`${p.player_name} checked into game`);
      }
    }
    setActivePlayers(newSet);

    const recentAct = {
      player_name: p.player_name,
      action: actionLabel,
      team_id: p.team_id,
      timestamp: new Date().toISOString()
    };

    recordLiveGameAction({
      matchId: match.match_id,
      playerId: p.player_id,
      sport: match.sport,
      statKey: "substitutions",
      statIncrement: 1,
      activePlayerIds: Array.from(newSet),
      recentAction: recentAct,
      activityLogMessage: `${user?.name || "Official"}: ${logMsg}`
    });
  };

  useEffect(() => {
    let interval: any;
    if (match?.clock_status === "running" && match?.last_clock_update !== undefined && match?.remaining_seconds !== undefined) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - match?.last_clock_update!) / 1000);
        let currentRemaining = match?.remaining_seconds! - elapsed;
        
        if (match.sport === 'Volleyball') {
           // Volleyball timer counts up
           const timeSinceStart = Math.floor((Date.now() - match?.last_clock_update!) / 1000);
           const m = Math.floor(timeSinceStart / 60);
           const s = timeSinceStart % 60;
           setTime(`${m}:${s.toString().padStart(2, "0")}`);
        } else {
           // Count down logic
           if (currentRemaining <= 0) {
              currentRemaining = 0;
              recordLiveGameAction({
                matchId: match!.match_id,
                clockStatus: "paused",
                remainingTime: "0:00",
                remainingSeconds: 0,
                activityLogMessage: `Match #${match!.match_id} clock reached 0:00`
              });
           }
           const m = Math.floor(currentRemaining / 60);
           const s = currentRemaining % 60;
           setTime(`${m}:${s.toString().padStart(2, "0")}`);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [match?.clock_status, match?.last_clock_update, match?.remaining_seconds, match?.match_id, recordLiveGameAction]);
  if (!match) return null;

  const t1 = db.teams.find(t => t.team_id === match.team1_id);
  const t2 = db.teams.find(t => t.team_id === match.team2_id);
  
  const isMens = match.category === "Men's Division";
  const isWomens = match.category === "Women's Division";

  const t1Players = db.players.filter(p => p.team_id === match.team1_id && (!isMens || p.gender === "Male") && (!isWomens || p.gender === "Female"));
  const t2Players = db.players.filter(p => p.team_id === match.team2_id && (!isMens || p.gender === "Male") && (!isWomens || p.gender === "Female"));

  const actions = QUICK_ACTIONS[match.sport] || [{ label: "+1 Point", stat: "points", pts: 1, inc: 1 }];

  const handleQuickAction = (player: Player, action: any, isTeam1: boolean) => {
    // Save history for undo
    setActionHistory(prev => [...prev, {
      playerId: player.player_id,
      stat: action.stat,
      inc: action.inc,
      pts: action.pts,
      oldS1: match.score_team1,
      oldS2: match.score_team2,
      oldR1: match.t1_rounds || 0,
      oldR2: match.t2_rounds || 0,
      oldStatus: match.status,
      oldWinner: match.winner || null,
      oldClockStatus: match.clock_status || "paused",
      oldRecentAction: match.recent_action || null
    }]);

    // Check for special Gam-jeom rule (Taekwondo)
    let extraPointsT1 = 0;
    let extraPointsT2 = 0;
    if (action.stat === "gam_jeom" && match.sport === "Taekwondo") {
      // Gam-jeom on Player A automatically grants 1 point to Player B
      if (isTeam1) extraPointsT2 += 1;
      else extraPointsT1 += 1;
    }

    let newS1 = match.score_team1;
    let newS2 = match.score_team2;
    let t1_rounds = match.t1_rounds || 0;
    let t2_rounds = match.t2_rounds || 0;
    let newStatus = match.status;
    let newWinner = match.winner;
    let newClockStatus = match.clock_status;

    // Update match score if points are involved
    if (action.pts > 0 || extraPointsT1 > 0 || extraPointsT2 > 0) {
      newS1 = match.score_team1 + (isTeam1 ? action.pts : 0) + extraPointsT1;
      newS2 = match.score_team2 + (!isTeam1 ? action.pts : 0) + extraPointsT2;
      
      let checkRoundWin = false;
      let checkMatchWin = false;

      // Rules mapping
      let targetScore = 0;
      let winByTwo = false;
      let maxRoundsToWin = 1;

      if (match.sport === 'Volleyball') {
        targetScore = 25;
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
        targetScore = 12;
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
         
         if (t1_rounds >= maxRoundsToWin || t2_rounds >= maxRoundsToWin) {
             checkMatchWin = true;
         } else {
             newS1 = 0;
             newS2 = 0;
         }
      }

      if (checkMatchWin) {
         newClockStatus = "paused";
         newStatus = "completed";
         newWinner = t1_rounds >= maxRoundsToWin ? (t1?.team_name || null) : (t2?.team_name || null);
      }
    }

    const recentAct = {
      player_name: player.player_name,
      action: action.label,
      team_id: isTeam1 ? t1!.team_id : t2!.team_id,
      timestamp: new Date().toISOString()
    };

    const logMsg = `${user?.name || "Official"} recorded ${action.label} for ${player.player_name} (${isTeam1 ? t1?.team_name : t2?.team_name})`;

    recordLiveGameAction({
      matchId: match.match_id,
      playerId: player.player_id,
      sport: match.sport,
      statKey: action.stat as any,
      statIncrement: action.inc,
      ptsIncrement: action.pts,
      scoreTeam1: newS1,
      scoreTeam2: newS2,
      t1Rounds: t1_rounds,
      t2Rounds: t2_rounds,
      clockStatus: newClockStatus,
      matchStatus: newStatus,
      winner: newWinner,
      recentAction: recentAct,
      activityLogMessage: logMsg
    });
  };

  const handleUndo = () => {
    if (actionHistory.length === 0) return;
    const lastAction = actionHistory[actionHistory.length - 1];
    
    recordLiveGameAction({
      matchId: match.match_id,
      playerId: lastAction.playerId,
      sport: match.sport,
      statKey: lastAction.stat,
      statIncrement: -lastAction.inc,
      ptsIncrement: lastAction.pts ? -lastAction.pts : 0,
      scoreTeam1: lastAction.oldS1,
      scoreTeam2: lastAction.oldS2,
      t1Rounds: lastAction.oldR1,
      t2Rounds: lastAction.oldR2,
      clockStatus: lastAction.oldClockStatus,
      matchStatus: lastAction.oldStatus,
      winner: lastAction.oldWinner,
      recentAction: lastAction.oldRecentAction,
      activityLogMessage: `${user?.name || "Official"} undid last action`
    });

    setActionHistory(prev => prev.slice(0, -1));
  };

  const handleUpdateClock = () => {
    const { secs, str } = parseTime(time);
    setTime(str);
    updateMatchDetails(match.match_id, match.venue || "", match.referee || "", period, str);
    
    recordLiveGameAction({
      matchId: match.match_id,
      remainingTime: str,
      remainingSeconds: secs,
      lastClockUpdate: Date.now(),
      activityLogMessage: `${user?.name || "Official"} updated clock for match #${match.match_id} to ${period} ${str}`
    });
  };

  const parseTime = (t: string) => {
    if (!t) return { secs: 0, str: "0:00" };
    const parts = t.split(":");
    let secs = 0;
    if (parts.length === 2) {
      secs = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
    } else {
      secs = (parseInt(t) || 0) * 60;
    }
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return { secs, str: `${m}:${s.toString().padStart(2, "0")}` };
  };

  const toggleTimer = () => {
    if (match.clock_status === "running") {
      const { secs, str } = parseTime(time);
      setTime(str);
      recordLiveGameAction({
        matchId: match.match_id,
        clockStatus: "paused",
        remainingTime: str,
        remainingSeconds: secs,
        lastClockUpdate: Date.now(),
        activityLogMessage: `${user?.name || "Official"} paused clock at ${str}`
      });
    } else {
      let t = time;
      if (!t || t === "0:00" || t === "0") {
         t = match.sport === "Basketball" ? "10:00" : (match.sport === "Volleyball" ? "15:00" : "10:00");
      }
      const { secs, str } = parseTime(t);
      setTime(str);
      recordLiveGameAction({
        matchId: match.match_id,
        matchStatus: "live",
        clockStatus: "running",
        lastClockUpdate: Date.now(),
        remainingSeconds: secs,
        remainingTime: str,
        activityLogMessage: `${user?.name || "Official"} started clock at ${str}`
      });
    }
  };

  const handleTimeout = (isTeam1: boolean) => {
    let t1outs = match.timeouts_team1 !== undefined ? match.timeouts_team1 : 2;
    let t2outs = match.timeouts_team2 !== undefined ? match.timeouts_team2 : 2;
    
    if (isTeam1) {
      t1outs = Math.max(0, t1outs - 1);
    } else {
      t2outs = Math.max(0, t2outs - 1);
    }

    const { secs, str } = parseTime(time);
    setTime(str);

    recordLiveGameAction({
      matchId: match.match_id,
      timeoutsTeam1: t1outs,
      timeoutsTeam2: t2outs,
      clockStatus: "paused",
      remainingTime: str,
      remainingSeconds: secs,
      recentAction: {
        player_name: "TEAM",
        action: "TIMEOUT",
        team_id: isTeam1 ? t1!.team_id : t2!.team_id,
        timestamp: new Date().toISOString()
      },
      activityLogMessage: `${user?.name || "Official"} recorded a TIMEOUT for ${isTeam1 ? t1?.team_name : t2?.team_name}`
    });
  };

  const handleSetTimeout = (isTeam1: boolean, val: number) => {
    let t1outs = match.timeouts_team1 !== undefined ? match.timeouts_team1 : 2;
    let t2outs = match.timeouts_team2 !== undefined ? match.timeouts_team2 : 2;
    if (isTeam1) t1outs = Math.max(0, val);
    else t2outs = Math.max(0, val);
    
    recordLiveGameAction({
      matchId: match.match_id,
      timeoutsTeam1: t1outs,
      timeoutsTeam2: t2outs
    });
  };

  const handleEndMatch = () => {
    recordLiveGameAction({
      matchId: match.match_id,
      clockStatus: "paused",
      remainingTime: time,
      matchStatus: "completed",
      activityLogMessage: `${user?.name || "Official"} ended match #${match.match_id}`
    });
    setConfirmEnd(false);
    onClose();
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#f8fafc", zIndex: 2000, display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
      {/* Top Black Bar with Title and Remaining Timeouts Tracker */}
      <div style={{ background: "#18181b", padding: "12px 24px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #27272a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "18px", fontWeight: "700", letterSpacing: "0.5px" }}>Live Match Controller</span>
          <span style={{ background: "#27272a", color: "#a1a1aa", fontSize: "11px", padding: "3px 10px", borderRadius: "100px", fontWeight: "600" }}>
            {match.sport} • {match.category}
          </span>
        </div>

        {/* Top Remaining Timeouts Tracker */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#a1a1aa", fontWeight: "700" }}>Remaining Timeouts:</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#27272a", padding: "4px 14px", borderRadius: "100px", border: "1px solid #3f3f46" }}>
            <span style={{ fontSize: "12px", color: "#93c5fd", fontWeight: "700" }}>{t1?.team_name || "Home"}:</span>
            <span style={{ fontSize: "14px", color: "#ffffff", fontWeight: "900" }}>{match.timeouts_team1 !== undefined ? match.timeouts_team1 : 2}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#27272a", padding: "4px 14px", borderRadius: "100px", border: "1px solid #3f3f46" }}>
            <span style={{ fontSize: "12px", color: "#fca5a5", fontWeight: "700" }}>{t2?.team_name || "Away"}:</span>
            <span style={{ fontSize: "14px", color: "#ffffff", fontWeight: "900" }}>{match.timeouts_team2 !== undefined ? match.timeouts_team2 : 2}</span>
          </div>
        </div>
      </div>

      {subToast && (
        <div style={{ position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)", background: "#10b981", color: "white", padding: "8px 24px", borderRadius: "100px", fontWeight: "600", fontSize: "14px", zIndex: 3000, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", gap: "8px", animation: "fadeIn 0.2s ease-out" }}>
          🔄 {subToast}
        </div>
      )}

      {/* Header section */}
      <div style={{ background: "#ffffff", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "20px", color: "#64748b" }}>✕</button>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#2563eb", fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>{match.category} {match.sport}</span>
            <span style={{ color: "#64748b", fontSize: "11px", marginTop: "2px" }}>{match.game_label} - Match #{match.match_id}</span>
          </div>
          
          {/* Editable Referee manual input */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", padding: "4px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", marginLeft: "12px" }}>
            <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Referee:</span>
            <input 
              type="text" 
              value={referee} 
              onChange={e => setReferee(e.target.value)} 
              onBlur={() => updateMatchDetails(match.match_id, match.venue || "", referee, period, time)}
              placeholder="Type referee name..." 
              style={{ background: "transparent", border: "none", color: "#1e293b", fontSize: "12px", fontWeight: "600", outline: "none", width: "140px" }}
            />
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
          {confirmEnd ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(239, 68, 68, 0.15)", padding: "4px 12px", borderRadius: "100px", border: "1px solid #ef4444" }}>
              <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: "700" }}>End match now?</span>
              <button 
                onClick={handleEndMatch}
                style={{ background: "#ef4444", border: "none", color: "white", padding: "4px 12px", borderRadius: "100px", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}
              >
                Yes, End
              </button>
              <button 
                onClick={() => setConfirmEnd(false)}
                style={{ background: "transparent", border: "none", color: "#64748b", padding: "4px 8px", fontSize: "11px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmEnd(true)} style={{ background: "#ef4444", border: "none", color: "white", padding: "8px 24px", borderRadius: "100px", fontWeight: "600", fontSize: "12px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)" }} onMouseOver={e => e.currentTarget.style.background = "#dc2626"} onMouseOut={e => e.currentTarget.style.background = "#ef4444"}>
              END MATCH
            </button>
          )}
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
             <div style={{ display: "flex", gap: "64px", marginTop: (match.sport !== "Basketball") ? "0px" : "80px" }}>
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                 <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700", letterSpacing: "1px", marginBottom: "8px" }}>TIMEOUTS LEFT</span>
                 <input 
                   type="number" 
                   value={match.timeouts_team1 || 0} 
                   onChange={e => handleSetTimeout(true, parseInt(e.target.value) || 0)}
                   style={{ width: "60px", textAlign: "center", fontSize: "28px", color: "#1e293b", fontWeight: "800", border: "2px solid #e2e8f0", borderRadius: "12px", background: "white", padding: "4px 0", marginBottom: "12px" }} 
                 />
                 <button onClick={() => handleTimeout(true)} style={{ background: "#f1f5f9", border: "none", color: "#475569", borderRadius: "100px", fontSize: "11px", fontWeight: "700", padding: "8px 16px", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#e2e8f0"} onMouseOut={e => e.currentTarget.style.background = "#f1f5f9"}>CALL TIMEOUT</button>
               </div>
               
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                 <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700", letterSpacing: "1px", marginBottom: "8px" }}>TIMEOUTS LEFT</span>
                 <input 
                   type="number" 
                   value={match.timeouts_team2 || 0} 
                   onChange={e => handleSetTimeout(false, parseInt(e.target.value) || 0)}
                   style={{ width: "60px", textAlign: "center", fontSize: "28px", color: "#1e293b", fontWeight: "800", border: "2px solid #e2e8f0", borderRadius: "12px", background: "white", padding: "4px 0", marginBottom: "12px" }} 
                 />
                 <button onClick={() => handleTimeout(false)} style={{ background: "#f1f5f9", border: "none", color: "#475569", borderRadius: "100px", fontSize: "11px", fontWeight: "700", padding: "8px 16px", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#e2e8f0"} onMouseOut={e => e.currentTarget.style.background = "#f1f5f9"}>CALL TIMEOUT</button>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input 
                        type="checkbox" 
                        checked={activePlayers.has(p.player_id)} 
                        onChange={() => handleToggleActive(p)} 
                        title="Active on court"
                        style={{ cursor: "pointer", width: 14, height: 14, accentColor: "#2563eb" }}
                      />
                      <span style={{ color: "#1e293b", fontWeight: activePlayers.has(p.player_id) ? "700" : "500", fontSize: "13px" }}>{p.player_name}</span>
                    </div>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input 
                        type="checkbox" 
                        checked={activePlayers.has(p.player_id)} 
                        onChange={() => handleToggleActive(p)} 
                        title="Active on court"
                        style={{ cursor: "pointer", width: 14, height: 14, accentColor: "#2563eb" }}
                      />
                      <span style={{ color: "#1e293b", fontWeight: activePlayers.has(p.player_id) ? "700" : "500", fontSize: "13px" }}>{p.player_name}</span>
                    </div>
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
      <div style={{ position: "relative", background: "white", padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          {showActivityLog && (
            <div style={{ position: "absolute", bottom: "100%", right: "24px", marginBottom: "8px", width: "320px", background: "white", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", zIndex: 10, display: "flex", flexDirection: "column", maxHeight: "300px" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontWeight: "600", fontSize: "13px", color: "#0f172a" }}>Activity Log</div>
              <div style={{ padding: "8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                {db.activityLogs.filter(log => log.message.includes(match.sport)).slice().reverse().slice(0, 15).map((log, i) => (
                  <div key={i} style={{ padding: "8px", fontSize: "12px", color: "#475569", borderBottom: i < 14 ? "1px solid #f8fafc" : "none" }}>
                    <span style={{ color: "#94a3b8", fontSize: "10px", marginRight: "8px" }}>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {log.message}
                  </div>
                ))}
                {db.activityLogs.filter(log => log.message.includes(match.sport)).length === 0 && (
                  <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>No recent activity for this sport.</div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <button 
              onClick={handleUndo}
              disabled={actionHistory.length === 0}
              style={{ background: actionHistory.length > 0 ? "#ec4899" : "#f1f5f9", color: actionHistory.length > 0 ? "white" : "#94a3b8", padding: "8px 24px", borderRadius: "100px", fontWeight: "600", border: "none", fontSize: "11px", cursor: actionHistory.length > 0 ? "pointer" : "not-allowed", display: "flex", gap: "8px", alignItems: "center", letterSpacing: "0.5px", transition: "all 0.2s" }}
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
               UNDO LAST ACTION
            </button>
            <div style={{ background: "#f8fafc", padding: "8px 16px", borderRadius: "100px", fontSize: "11px", fontWeight: "600", color: "#475569", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ width: 6, height: 6, background: match.clock_status === "paused" ? "#1e293b" : "#22c55e", borderRadius: "50%" }}></span>
              {match.clock_status === "paused" ? "MATCH PAUSED" : "CLOCK RUNNING"}
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "8px 16px", borderRadius: "100px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: 6, height: 6, background: "#16a34a", borderRadius: "50%", animation: "pulse 2s infinite" }}></span>
              LIVE BROADCAST ACTIVE
            </div>
            <button onClick={() => setShowActivityLog(!showActivityLog)} style={{ background: showActivityLog ? "#eff6ff" : "transparent", color: "#3b82f6", padding: "8px 16px", borderRadius: "100px", fontSize: "11px", fontWeight: "600", border: "none", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", letterSpacing: "0.5px", transition: "all 0.2s" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              VIEW ACTIVITY LOG
            </button>
          </div>
      </div>
    </div>
  );
}
