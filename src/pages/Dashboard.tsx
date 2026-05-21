import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useDatabase } from "../context/DatabaseContext";
import { Navigate, Link } from "react-router-dom";
import { Activity, Save, RefreshCw, CheckCircle2, AlertCircle, PlusCircle, Users, UserPlus, Trash2, Edit, BarChart2, Download, Shield, GitMerge, X, ShieldCheck, Menu, LogOut, ChevronLeft, ChevronRight, LayoutDashboard, Trophy, Gamepad2, Flag, UserCog } from "lucide-react";
import { card, PP, Badge } from "../components/Shared";
import LiveMatchControlModal from "../components/LiveMatchControlModal";
import { Match, Player, Team, User, Bracket, BracketMatch } from "../types";
import { S_STATS, useW } from "../db";

const DashboardMatchCard = React.memo(({ 
  m, 
  t1, 
  t2, 
  isEditing, 
  s1, 
  s2, 
  setS1, 
  setS2, 
  setEditingMatch, 
  handleSaveMatchScore, 
  handleStatusChange, 
  deleteMatch, 
  setBoxScoreMatch,
  setLiveControlMatch
}: any) => {
  return (
    <div style={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 20, boxShadow: "0 0 15px var(--glow-color), 0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={Badge(m.status === "live" ? "#ef4444" : m.status === "completed" ? "#10b981" : "var(--text-muted)")}>
            {m.status.toUpperCase()}
          </span>
          {m.category && <span style={Badge("var(--border-hover)")}>{m.category}</span>}
          {m.game_label && <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, padding: "2px 6px", background: "var(--bg)", borderRadius: 4, whiteSpace: "nowrap" }}>{m.game_label}</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select 
            value={m.status}
            onChange={e => handleStatusChange(m.match_id, e.target.value as any, m)}
            style={{ background: "var(--border-color)", border: "none", color: "var(--text-main)", borderRadius: 4, padding: "4px 8px", fontSize: 12 }}
          >
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={() => { if(window.confirm('Delete match?')) deleteMatch(m.match_id); }} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={16} /></button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          {(m.sport === "Arnis" || m.sport === "Taekwondo") ? (
             <div style={{ fontSize: 13, fontWeight: 900, color: "#ef4444", marginBottom: 2 }}>RED <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>• {t1?.team_name}</span></div>
          ) : (
             <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>{t1?.team_name}</div>
          )}
          {isEditing ? (
            <input type="number" value={s1} onChange={e => setS1(parseInt(e.target.value) || 0)} style={{ width: 60, background: "var(--bg)", border: "2px solid #38bdf8", borderRadius: 8, padding: 8, color: "var(--text-main)", fontSize: 24, fontWeight: 900, textAlign: "center" }} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900 }}>{(m.sport !== "Basketball") ? (m.t1_rounds || 0) : m.score_team1}</div>
              {(m.sport !== "Basketball") && <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 800 }}>PTS: {m.score_team1}</div>}
            </div>
          )}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--border-color)", textAlign: "center" }}>
          VS
          {(m.sport !== "Basketball") && <div style={{ fontSize: 10, marginTop: 4, color: "var(--text-muted)" }}>SETS/RNDS</div>}
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          {(m.sport === "Arnis" || m.sport === "Taekwondo") ? (
             <div style={{ fontSize: 13, fontWeight: 900, color: "#3b82f6", marginBottom: 2 }}>BLUE <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>• {t2?.team_name}</span></div>
          ) : (
             <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>{t2?.team_name}</div>
          )}
          {isEditing ? (
            <input type="number" value={s2} onChange={e => setS2(parseInt(e.target.value) || 0)} style={{ width: 60, background: "var(--bg)", border: "2px solid #38bdf8", borderRadius: 8, padding: 8, color: "var(--text-main)", fontSize: 24, fontWeight: 900, textAlign: "center" }} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900 }}>{(m.sport !== "Basketball") ? (m.t2_rounds || 0) : m.score_team2}</div>
              {(m.sport !== "Basketball") && <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 800 }}>PTS: {m.score_team2}</div>}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        {isEditing ? (
          <>
            <button onClick={() => handleSaveMatchScore(m.match_id)} style={{ flex: 1, background: "#10b981", color: "var(--text-main)", border: "none", padding: "12px", borderRadius: 8, fontWeight: 900, cursor: "pointer", fontSize: 16 }}>SAVE SCORE</button>
            <button onClick={() => setEditingMatch(null)} style={{ flex: 1, background: "var(--panel-bg)", color: "var(--text-main)", border: "1px solid var(--border-color)", padding: "12px", borderRadius: 8, fontWeight: 900, cursor: "pointer", fontSize: 16 }}>CANCEL</button>
          </>
        ) : (
          <>
            <button onClick={() => setLiveControlMatch(m.match_id)} style={{ flex: "1 1 auto", width: "100%", background: "#ef4444", color: "var(--text-main)", border: "none", padding: "16px", borderRadius: 12, fontWeight: 900, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 12px rgba(239, 68, 68, 0.3)" }}><Activity size={24} /> LIVE CONTROL</button>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button onClick={() => { setEditingMatch(m.match_id); setS1(m.score_team1); setS2(m.score_team2); }} style={{ flex: 1, background: "var(--border-color)", color: "#38bdf8", border: "none", padding: "12px", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>Edit Score</button>
              <button onClick={() => setBoxScoreMatch(m.match_id)} style={{ flex: 1, background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)", padding: "12px", borderRadius: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><BarChart2 size={18} /> Box Score</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { 
    db, 
    addMatch,
    updateMatchScore, 
    updateMatchStatus, 
    deleteMatch,
    addTeam, 
    deleteTeam,
    addPlayer, 
    deletePlayer,
    updatePlayerStat,
    addUser,
    deleteUser,
    addActivityLog,
    updateBracket,
    addSport,
    addReferee,
    deleteReferee
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<"matches" | "teams" | "players" | "users" | "activity" | "brackets" | "referees">("matches");
  const w = useW();
  const mob = w < 768;
  const [isSidebarOpen, setIsSidebarOpen] = useState(!mob);

  // Update sidebar on mobile change
  useEffect(() => {
    if (mob) setIsSidebarOpen(false);
  }, [mob]);

  const [msg, setMsg] = useState<{ t: "s" | "e", m: string } | null>(null);

  // Match State
  const [matchSportFilter, setMatchSportFilter] = useState("");
  useEffect(() => { if(!matchSportFilter && db.sports.length) setMatchSportFilter(db.sports[0]); }, [db.sports, matchSportFilter]);
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [s1, setS1] = useState(0);
  const [s2, setS2] = useState(0);
  const [boxScoreMatch, setBoxScoreMatch] = useState<number | null>(null);
  const [liveControlMatch, setLiveControlMatch] = useState<number | null>(null);

  // Add Team State
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamSport, setNewTeamSport] = useState("");
  useEffect(() => { if(!newTeamSport && db.sports.length) setNewTeamSport(db.sports[0]); }, [db.sports, newTeamSport]);
  const [newTeamCoach, setNewTeamCoach] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState("");

  // Add Player State
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerTeam, setNewPlayerTeam] = useState("");
  const [newPlayerJersey, setNewPlayerJersey] = useState("");
  const [newPlayerGender, setNewPlayerGender] = useState("Male");

  // Add User State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"ADMIN" | "TABULATOR">("TABULATOR");

  // System State
  const [newSportName, setNewSportName] = useState("");

  // Referee State
  const [newRefName, setNewRefName] = useState("");
  const [newRefSport, setNewRefSport] = useState("");
  useEffect(() => { if(!newRefSport && db.sports.length) setNewRefSport(db.sports[0]); }, [db.sports, newRefSport]);
  const [newRefContact, setNewRefContact] = useState("");

  // Bracket State
  const [bracketSport, setBracketSport] = useState("");
  useEffect(() => { if(!bracketSport && db.sports.length) setBracketSport(db.sports[0]); }, [db.sports, bracketSport]);
  const [editingBracket, setEditingBracket] = useState<Bracket | null>(null);

  // New Match State
  const [showAddMatchForm, setShowAddMatchForm] = useState(false);
  const [newMatch, setNewMatch] = useState({
    team1_id: "",
    team2_id: "",
    match_date: "",
    game_label: "",
    venue: "",
    referee: "",
    category: "Men's Division",
    scheduled_start_time: ""
  });

  useEffect(() => {
    const b = db.brackets.find(b => b.sport === bracketSport);
    if (b) {
      setEditingBracket(JSON.parse(JSON.stringify(b)));
    } else {
      setEditingBracket({
        sport: bracketSport,
        qf: Array(4).fill(null).map(() => ({ team1: "", team2: "", score1: 0, score2: 0, winner: "" })),
        sf: Array(2).fill(null).map(() => ({ team1: "", team2: "", score1: 0, score2: 0, winner: "" })),
        final: { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
        champion: ""
      });
    }
  }, [bracketSport, db.brackets]);

  if (!user) return <Navigate to="/login" />;

  const showMsg = (type: "s" | "e", text: string) => {
    setMsg({ t: type, m: text });
    setTimeout(() => setMsg(null), 3000);
  };

  const teamsMap = useMemo(() => {
    const map: Record<number, Team> = {};
    db.teams.forEach(t => map[t.team_id] = t);
    return map;
  }, [db.teams]);

  const filteredMatches = useMemo(() => db.matches.filter(m => m.sport === matchSportFilter), [db.matches, matchSportFilter]);

  // --- Handlers ---

  const handleSaveMatchScore = useCallback((matchId: number) => {
    updateMatchScore(matchId, s1, s2);
    setEditingMatch(null);
    addActivityLog(`${user?.name} updated score for match #${matchId} to ${s1}-${s2}`);
    showMsg("s", "Match score updated successfully!");
  }, [s1, s2, updateMatchScore, addActivityLog, user]);

  const handleStatusChange = useCallback((matchId: number, status: "upcoming" | "live" | "completed", m: Match) => {
    let winner = m.winner;
    if (status === "completed") {
      if (m.score_team1 > m.score_team2) winner = teamsMap[m.team1_id]?.team_name;
      else if (m.score_team2 > m.score_team1) winner = teamsMap[m.team2_id]?.team_name;
      else winner = "Draw";
    } else {
      winner = null;
    }
    updateMatchStatus(matchId, status, winner);
    addActivityLog(`${user?.name} changed match #${matchId} status to ${status}`);
    showMsg("s", `Match status updated to ${status}`);
  }, [teamsMap, updateMatchStatus, addActivityLog, user]);

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamCoach.trim()) return showMsg("e", "Please fill in all team fields.");
    addTeam({ team_name: newTeamName, sport: newTeamSport, coach_name: newTeamCoach, logo: newTeamLogo });
    addActivityLog(`${user.name} added a new team: ${newTeamName} (${newTeamSport})`);
    setNewTeamName(""); setNewTeamCoach(""); setNewTeamLogo("");
    showMsg("s", "Team added successfully!");
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !newPlayerTeam || !newPlayerJersey) return showMsg("e", "Please fill in all player fields.");
    const teamId = parseInt(newPlayerTeam);
    const team = db.teams.find(t => t.team_id === teamId);
    if (!team) return;
    const jerseyValue = (team.sport === "Taekwondo" || team.sport === "Arnis") ? newPlayerJersey : parseInt(newPlayerJersey);
    addPlayer({ player_name: newPlayerName, team_id: teamId, sport: team.sport, jersey_number: jerseyValue, gender: newPlayerGender as any });
    addActivityLog(`${user.name} added player ${newPlayerName} to team ${team.team_name}`);
    setNewPlayerName(""); setNewPlayerJersey("");
    showMsg("s", "Player added successfully!");
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) return showMsg("e", "Please fill in all user fields.");
    addUser({ name: newUserName, email: newUserEmail, password: newUserPassword, role: newUserRole });
    addActivityLog(`${user.name} created a new ${newUserRole} user: ${newUserName}`);
    setNewUserName(""); setNewUserEmail(""); setNewUserPassword("");
    showMsg("s", "User added successfully!");
  };

  const handleAddSport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSportName.trim()) return showMsg("e", "Please enter a sport name.");
    if (db.sports.includes(newSportName)) return showMsg("e", "Sport already exists!");
    addSport(newSportName);
    setNewSportName("");
    showMsg("s", "Sport added successfully! You can now add teams and matches for it.");
  };

  const handleAddReferee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefName.trim()) return showMsg("e", "Please enter referee name.");
    addReferee({ name: newRefName, sport: newRefSport, contact: newRefContact });
    addActivityLog(`${user?.name} added new referee: ${newRefName} for ${newRefSport}`);
    setNewRefName(""); setNewRefContact("");
    showMsg("s", "Referee added successfully!");
  };

  const handleScheduleMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch.team1_id || !newMatch.team2_id || !newMatch.game_label || !newMatch.match_date) {
      return showMsg("e", "Please fill in all required fields (Teams, Game Label, Date).");
    }
    if (newMatch.team1_id === newMatch.team2_id) {
      return showMsg("e", "Team 1 and Team 2 cannot be the same.");
    }
    
    addMatch({
      sport: matchSportFilter,
      team1_id: parseInt(newMatch.team1_id),
      team2_id: parseInt(newMatch.team2_id),
      match_date: newMatch.match_date,
      score_team1: 0,
      score_team2: 0,
      winner: null,
      status: "upcoming",
      game_label: newMatch.game_label,
      category: newMatch.category,
      venue: newMatch.venue,
      referee: newMatch.referee,
      scheduled_start_time: newMatch.scheduled_start_time
    });
    
    addActivityLog(`${user.name} scheduled a new match: ${teamsMap[parseInt(newMatch.team1_id)]?.team_name} vs ${teamsMap[parseInt(newMatch.team2_id)]?.team_name}`);
    setShowAddMatchForm(false);
    setNewMatch({ team1_id: "", team2_id: "", match_date: "", game_label: "", venue: "", referee: "", category: "Men's Division", scheduled_start_time: "" });
    showMsg("s", "Match scheduled successfully!");
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tournament_data_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addActivityLog(`${user.name} exported database to JSON`);
  };

  const handleSaveBracket = () => {
    if (editingBracket) {
      updateBracket(bracketSport, editingBracket);
      addActivityLog(`${user.name} updated the bracket for ${bracketSport}`);
      showMsg("s", "Bracket saved successfully!");
    }
  };

  const handleAutoGenerateBracket = () => {
    const teamsForSport = db.teams.filter(t => t.sport === bracketSport);
    if (teamsForSport.length < 2) {
      return showMsg("e", "At least 2 teams are needed to generate a bracket.");
    }

    // Shuffle teams
    const shuffled = [...teamsForSport].sort(() => Math.random() - 0.5);
    
    const newBracket: Bracket = {
      sport: bracketSport,
      qf: Array(4).fill(null).map((_, i) => ({
        team1: shuffled[i * 2]?.team_name || "",
        team2: shuffled[i * 2 + 1]?.team_name || "",
        score1: 0,
        score2: 0,
        winner: ""
      })),
      sf: Array(2).fill(null).map(() => ({ team1: "", team2: "", score1: 0, score2: 0, winner: "" })),
      final: { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
      champion: ""
    };

    setEditingBracket(newBracket);
    showMsg("s", `Generated a new bracket for ${bracketSport} with ${Math.min(shuffled.length, 8)} teams! Don't forget to SAVE.`);
  };

  const updateBracketMatch = (round: "qf" | "sf" | "final", index: number, field: keyof BracketMatch, value: any) => {
    if (!editingBracket) return;
    const newBracket = { ...editingBracket };
    if (round === "final") {
      newBracket.final = { ...newBracket.final, [field]: value };
    } else {
      newBracket[round][index] = { ...newBracket[round][index], [field]: value };
    }
    setEditingBracket(newBracket);
  };

  // --- Render Helpers ---

  const renderSidebar = () => {
    const tabs = [
      { id: "matches", label: "Matches", icon: Gamepad2, color: "#f97316" }, 
      { id: "teams", label: "Teams", icon: Shield, color: "#3b82f6" }, 
      { id: "players", label: "Players", icon: Users, color: "#10b981" }, 
      { id: "referees", label: "Referees", icon: Flag, color: "#06b6d4" },
      { id: "brackets", label: "Brackets", icon: Trophy, color: "#8b5cf6" }, 
      { id: "system", label: "Add Sport", icon: PlusCircle, color: "#f59e0b" },
      { id: "activity", label: "Activity Logs", icon: Activity, color: "#64748b" }
    ].concat(user.role === "ADMIN" ? [{ id: "users", label: "Admin Users", icon: UserCog, color: "#ef4444" }] : []);

    return (
      <>
        {mob && isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)} 
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90, backdropFilter: "blur(2px)" }}
          />
        )}
        <div style={{
          width: isSidebarOpen ? 260 : (mob ? 0 : 80),
          height: "100vh",
          background: "var(--panel-bg)",
          borderRight: "1px solid var(--border-color)",
          transition: "all 0.3s ease",
          display: "flex",
          flexDirection: "column",
          position: mob ? "fixed" : "sticky",
          top: 0,
          left: 0,
          overflowY: "auto",
          overflowX: "hidden",
          zIndex: 100,
          transform: mob && !isSidebarOpen ? "translateX(-100%)" : "translateX(0)",
          boxShadow: mob && isSidebarOpen ? "5px 0 25px rgba(0,0,0,0.5)" : "none"
        }}>
          <div style={{ 
            padding: isSidebarOpen ? "24px" : "24px 0", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: isSidebarOpen ? "space-between" : "center",
            borderBottom: "1px solid var(--border-color)",
            marginBottom: 16
          }}>
            {isSidebarOpen && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)", width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold" }}>
                  <Activity size={20} />
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>SportsMetrics</h2>
              </div>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ 
                background: "transparent", 
                border: "none", 
                color: "var(--text-muted)", 
                cursor: "pointer",
                padding: 8,
                borderRadius: 8,
                display: mob && !isSidebarOpen ? "none" : "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Menu size={20} />
            </button>
          </div>

          <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 8 }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); if (mob) setIsSidebarOpen(false); }}
                  style={{ 
                    background: isActive ? `${tab.color}15` : "transparent",
                    color: isActive ? tab.color : "var(--text-main)", 
                    border: "none",
                    borderLeft: isActive ? `4px solid ${tab.color}` : "4px solid transparent",
                    padding: isSidebarOpen ? "12px 16px" : "16px", 
                    borderRadius: isSidebarOpen ? "0 12px 12px 0" : 12, 
                    fontWeight: isActive ? 800 : 600, 
                    cursor: "pointer",
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isSidebarOpen ? "flex-start" : "center",
                    gap: 16,
                    transition: "all 0.2s"
                  }}
                >
                  <Icon size={20} style={{ flexShrink: 0 }} />
                  {isSidebarOpen && <span>{tab.label}</span>}
                </button>
              );
            })}
          </nav>

          <div style={{ padding: "24px 16px", borderTop: "1px solid var(--border-color)", marginTop: "auto" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12, 
              background: "var(--bg)", 
              padding: 12, 
              borderRadius: 16, 
              justifyContent: isSidebarOpen ? "flex-start" : "center",
              marginBottom: isSidebarOpen ? 16 : 0
            }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 16, flexShrink: 0 }}>
                {user.name.charAt(0)}
              </div>
              {isSidebarOpen && (
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{user.role}</div>
                </div>
              )}
            </div>
            
            {isSidebarOpen && (
               <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                 <Link to="/" style={{ flex: 1, textDecoration: "none" }}>
                   <button style={{ width: "100%", background: "var(--border-color)", color: "var(--text-main)", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <LayoutDashboard size={14} /> View Site
                   </button>
                 </Link>
                 <button onClick={logout} style={{ flex: 1, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <LogOut size={14} /> Logout
                 </button>
               </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderMatchesTab = () => {
    const teamsForSport = db.teams.filter(t => t.sport === matchSportFilter);
    
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Manage Matches</h2>
            
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {db.sports.map(s => (
                <button
                  key={s}
                  onClick={() => setMatchSportFilter(s)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontWeight: 800,
                    fontSize: 14,
                    border: "none",
                    cursor: "pointer",
                    background: matchSportFilter === s ? "#38bdf8" : "var(--panel-bg)",
                    color: matchSportFilter === s ? "#fff" : "var(--text-muted)",
                    boxShadow: matchSportFilter === s ? "0 4px 10px rgba(56, 189, 248, 0.3)" : "none",
                    transition: "all 0.2s"
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setShowAddMatchForm(!showAddMatchForm)}
            style={{ background: showAddMatchForm ? "var(--border-color)" : "#38bdf8", color: showAddMatchForm ? "var(--text-main)" : "var(--bg)", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 16 }}
          >
            {showAddMatchForm ? <X size={20} /> : <PlusCircle size={20} />}
            {showAddMatchForm ? "CANCEL" : "SCHEDULE MATCH"}
          </button>
        </div>

        {showAddMatchForm && (
          <div style={{ ...card, background: "linear-gradient(135deg, var(--panel-bg) 0%, var(--bg) 100%)", padding: 32, border: "2px solid #38bdf8", boxShadow: "0 0 30px rgba(56, 189, 248, 0.2)" }}>
            <h3 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 900 }}>Schedule New {matchSportFilter} Match</h3>
            <form onSubmit={handleScheduleMatch} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Team 1</label>
                  <select 
                    value={newMatch.team1_id} 
                    onChange={e => setNewMatch({...newMatch, team1_id: e.target.value})}
                    style={{ width: "100%", padding: 12, borderRadius: 12, background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: 16, fontWeight: 700 }}
                  >
                    <option value="" style={{ color: "#000" }}>Select Team 1</option>
                    {teamsForSport.map(t => <option key={t.team_id} value={t.team_id.toString()} style={{ color: "#000" }}>{t.team_name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Team 2</label>
                  <select 
                    value={newMatch.team2_id} 
                    onChange={e => setNewMatch({...newMatch, team2_id: e.target.value})}
                    style={{ width: "100%", padding: 12, borderRadius: 12, background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: 16, fontWeight: 700 }}
                  >
                    <option value="" style={{ color: "#000" }}>Select Team 2</option>
                    {teamsForSport.map(t => <option key={t.team_id} value={t.team_id.toString()} style={{ color: "#000" }}>{t.team_name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Game Label (e.g. Finals, Elimination)</label>
                  <input 
                    type="text" 
                    value={newMatch.game_label} 
                    onChange={e => setNewMatch({...newMatch, game_label: e.target.value})}
                    placeholder="e.g. Quarter Finals"
                    style={{ width: "100%", padding: 12, borderRadius: 12, background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: 16, fontWeight: 700 }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Date (e.g. October 25)</label>
                  <input 
                    type="text" 
                    value={newMatch.match_date} 
                    onChange={e => setNewMatch({...newMatch, match_date: e.target.value})}
                    placeholder="e.g. October 25"
                    style={{ width: "100%", padding: 12, borderRadius: 12, background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: 16, fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Division / Category</label>
                  <select 
                    value={newMatch.category || "Men's Division"} 
                    onChange={e => setNewMatch({...newMatch, category: e.target.value})}
                    style={{ width: "100%", padding: 12, borderRadius: 12, background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: 16, fontWeight: 700 }}
                  >
                    <option value="Men's Division">Men's Division</option>
                    <option value="Women's Division">Women's Division</option>
                    <option value="Mixed">Mixed / Open</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Scheduled Start (Optional for auto-live)</label>
                  <input 
                    type="datetime-local" 
                    value={newMatch.scheduled_start_time} 
                    onChange={e => setNewMatch({...newMatch, scheduled_start_time: e.target.value})}
                    style={{ width: "100%", padding: 12, borderRadius: 12, background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: 16, fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Venue</label>
                  <input 
                    type="text" 
                    value={newMatch.venue} 
                    onChange={e => setNewMatch({...newMatch, venue: e.target.value})}
                    placeholder="e.g. Main Gym"
                    style={{ width: "100%", padding: 12, borderRadius: 12, background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: 16, fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Referee</label>
                  <select 
                    value={newMatch.referee} 
                    onChange={e => setNewMatch({...newMatch, referee: e.target.value})}
                    style={{ width: "100%", padding: 12, borderRadius: 12, background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: 16, fontWeight: 700 }}
                  >
                    <option value="" style={{ color: "#000" }}>Select Referee</option>
                    {db.referees.filter(r => r.sport === matchSportFilter).map(r => (
                      <option key={r.referee_id} value={r.name} style={{ color: "#000" }}>{r.name}</option>
                    ))}
                    <option value="TBA">TBA</option>
                  </select>
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button type="submit" style={{ background: "#38bdf8", color: "var(--bg)", border: "none", padding: "16px 48px", borderRadius: 12, fontWeight: 900, fontSize: 18, cursor: "pointer", boxShadow: "0 8px 16px rgba(56, 189, 248, 0.3)" }}>
                  CONFIRM SCHEDULE
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 350px), 1fr))", gap: 20 }}>
          {filteredMatches.map(m => {
            const t1 = teamsMap[m.team1_id];
            const t2 = teamsMap[m.team2_id];
            const isEditing = editingMatch === m.match_id;

            return (
              <DashboardMatchCard
                key={m.match_id}
                m={m}
                t1={t1}
                t2={t2}
                isEditing={isEditing}
                s1={isEditing ? s1 : m.score_team1}
                s2={isEditing ? s2 : m.score_team2}
                setS1={setS1}
                setS2={setS2}
                setEditingMatch={setEditingMatch}
                handleSaveMatchScore={handleSaveMatchScore}
                handleStatusChange={handleStatusChange}
                deleteMatch={deleteMatch}
                setBoxScoreMatch={setBoxScoreMatch}
                setLiveControlMatch={setLiveControlMatch}
              />
            );
          })}
          {filteredMatches.length === 0 && !showAddMatchForm && <div style={{ color: "var(--text-muted)", padding: 20, textAlign: "center", border: "2px dashed var(--border-color)", borderRadius: 16 }}>No matches found for this sport. Click "SCHEDULE MATCH" to create one!</div>}
        </div>
      </div>
    );
  };

  const renderTeamsTab = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 32 }}>
      <div style={{ ...card, background: "linear-gradient(135deg, var(--panel-bg) 0%, var(--bg) 100%)", padding: 32, boxShadow: "0 0 25px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ margin: "0 0 32px", fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 16 }}><Users size={32} color="#38bdf8" /> Add New Team</h2>
        <form onSubmit={handleAddTeam} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: 8 }}>Team Name</label>
            <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="e.g. Eagles" style={{ width: "100%", background: "var(--panel-bg)", border: "2px solid var(--border-color)", borderRadius: 12, padding: "16px", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }} />
          </div>
          <div>
            <label style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: 8 }}>Sport</label>
            <select value={newTeamSport} onChange={e => setNewTeamSport(e.target.value)} style={{ width: "100%", background: "var(--panel-bg)", border: "2px solid var(--border-color)", borderRadius: 12, padding: "16px", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }}>
              {db.sports.map(s => <option key={s} value={s} style={{ color: "#000" }}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: 8 }}>Coach Name</label>
            <input type="text" value={newTeamCoach} onChange={e => setNewTeamCoach(e.target.value)} placeholder="e.g. Coach Smith" style={{ width: "100%", background: "var(--panel-bg)", border: "2px solid var(--border-color)", borderRadius: 12, padding: "16px", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }} />
          </div>
          <div>
            <label style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: 8 }}>Team Logo</label>
            <input type="file" accept="image/*" onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setNewTeamLogo(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} style={{ width: "100%", background: "var(--panel-bg)", border: "2px solid var(--border-color)", borderRadius: 12, padding: "12px", color: "var(--text-main)" }} />
          </div>
          <button type="submit" style={{ background: "#38bdf8", color: "var(--bg)", border: "none", padding: "16px", borderRadius: 12, fontWeight: 900, fontSize: 18, cursor: "pointer", marginTop: 8, boxShadow: "0 8px 16px rgba(56, 189, 248, 0.3)" }}>+ CREATE TEAM</button>
        </form>
      </div>
      <div style={{ ...card, padding: 32 }}>
        <h2 style={{ margin: "0 0 32px", fontSize: 24, fontWeight: 900 }}>Team List</h2>
        <div style={{ maxHeight: 500, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {db.teams.map(t => (
            <div key={t.team_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--panel-bg)", padding: 20, borderRadius: 16, border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {t.logo ? <img src={t.logo} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover" }} /> : <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{t.team_name.substring(0,2).toUpperCase()}</div>}
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{t.team_name}</div>
                  <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>{t.sport} • Coach: {t.coach_name}</div>
                </div>
              </div>
              <button onClick={() => { if(window.confirm('Delete team?')) deleteTeam(t.team_id); }} style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", cursor: "pointer", padding: 12, borderRadius: 12 }}><Trash2 size={24} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlayersTab = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 32 }}>
      <div style={{ ...card, background: "linear-gradient(135deg, var(--panel-bg) 0%, var(--bg) 100%)", padding: 32, boxShadow: "0 0 25px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ margin: "0 0 32px", fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 16 }}><UserPlus size={32} color="#10b981" /> Add New Player</h2>
        <form onSubmit={handleAddPlayer} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: 8 }}>Player Name</label>
            <input type="text" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="e.g. John Doe" style={{ width: "100%", background: "var(--panel-bg)", border: "2px solid var(--border-color)", borderRadius: 12, padding: "16px", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }} />
          </div>
          <div>
            <label style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: 8 }}>Gender</label>
            <select value={newPlayerGender} onChange={e => setNewPlayerGender(e.target.value)} style={{ width: "100%", background: "var(--panel-bg)", border: "2px solid var(--border-color)", borderRadius: 12, padding: "16px", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }}>
              <option value="Male" style={{ color: "#000" }}>Male</option>
              <option value="Female" style={{ color: "#000" }}>Female</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: 8 }}>Select Team</label>
            <select value={newPlayerTeam} onChange={e => setNewPlayerTeam(e.target.value)} style={{ width: "100%", background: "var(--panel-bg)", border: "2px solid var(--border-color)", borderRadius: 12, padding: "16px", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }}>
              <option value="" disabled style={{ color: "#000" }}>Select a team...</option>
              {db.teams.map(t => <option key={t.team_id} value={t.team_id} style={{ color: "#000" }}>{t.team_name} ({t.sport})</option>)}
            </select>
          </div>
          <div>
            {newPlayerTeam && ["Taekwondo", "Arnis"].includes(db.teams.find(t => t.team_id === parseInt(newPlayerTeam))?.sport || "") ? (
               <>
                 <label style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: 8 }}>Armor Color</label>
                 <select value={newPlayerJersey} onChange={e => setNewPlayerJersey(e.target.value)} style={{ width: "100%", background: "var(--panel-bg)", border: "2px solid var(--border-color)", borderRadius: 12, padding: "16px", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }}>
                   <option value="" disabled style={{ color: "#000" }}>Select Color...</option>
                   <option value="Red" style={{ color: "#000" }}>Red</option>
                   <option value="Blue" style={{ color: "#000" }}>Blue</option>
                 </select>
               </>
            ) : (
               <>
                 <label style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: 8 }}>Jersey Number</label>
                 <input type="text" value={newPlayerJersey} onChange={e => setNewPlayerJersey(e.target.value)} placeholder="e.g. 23" style={{ width: "100%", background: "var(--panel-bg)", border: "2px solid var(--border-color)", borderRadius: 12, padding: "16px", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }} />
               </>
            )}
          </div>
          <button type="submit" style={{ background: "#10b981", color: "var(--text-main)", border: "none", padding: "16px", borderRadius: 12, fontWeight: 900, fontSize: 18, cursor: "pointer", marginTop: 8, boxShadow: "0 8px 16px rgba(16, 185, 129, 0.3)" }}>+ ADD PLAYER</button>
        </form>
      </div>
      <div style={{ ...card, padding: 32 }}>
        <h2 style={{ margin: "0 0 32px", fontSize: 24, fontWeight: 900 }}>Player List</h2>
        <div style={{ maxHeight: 500, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {db.players.map(p => (
            <div key={p.player_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--panel-bg)", padding: 20, borderRadius: 16, border: "1px solid var(--border-color)" }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{p.player_name} <span style={{ color: "#38bdf8", fontSize: 16, marginLeft: 8 }}>#{p.jersey_number}</span></div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>{teamsMap[p.team_id]?.team_name} • {p.sport}</div>
              </div>
              <button onClick={() => { if(window.confirm('Delete player?')) deletePlayer(p.player_id); }} style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", cursor: "pointer", padding: 12, borderRadius: 12 }}><Trash2 size={24} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBracketsTab = () => {
    if (!editingBracket) return null;
    const teamsForSport = db.teams.filter(t => t.sport === bracketSport);

    const renderMatchInputs = (match: BracketMatch, round: "qf" | "sf" | "final", index: number) => {
      // Only allow team selection for the first round of their structure, which could be qf, sf, or final depending on how many teams they have. To be safe, let's keep team selection open everywhere, but emphasize it's for initial setup.
      return (
      <div style={{ background: "var(--panel-bg)", padding: 16, borderRadius: 12, display: "flex", flexDirection: "column", gap: 12, border: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <select value={match.team1} onChange={e => updateBracketMatch(round, index, "team1", e.target.value)} style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border-color)", color: "var(--text-main)", padding: 8, borderRadius: 8, fontSize: 16, fontWeight: 700 }}>
            <option value="" style={{ color: "var(--text-muted)" }}>Select Team 1</option>
            {teamsForSport.map(t => <option key={t.team_id} value={t.team_name} style={{ color: "#000" }}>{t.team_name}</option>)}
          </select>
          <div style={{ width: 60, background: "var(--bg)", border: "2px solid var(--border-color)", color: "var(--text-muted)", padding: 8, borderRadius: 8, textAlign: "center", fontSize: 18, fontWeight: 900 }}>{match.score1 || 0}</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <select value={match.team2} onChange={e => updateBracketMatch(round, index, "team2", e.target.value)} style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border-color)", color: "var(--text-main)", padding: 8, borderRadius: 8, fontSize: 16, fontWeight: 700 }}>
            <option value="" style={{ color: "var(--text-muted)" }}>Select Team 2</option>
            {teamsForSport.map(t => <option key={t.team_id} value={t.team_name} style={{ color: "#000" }}>{t.team_name}</option>)}
          </select>
          <div style={{ width: 60, background: "var(--bg)", border: "2px solid var(--border-color)", color: "var(--text-muted)", padding: 8, borderRadius: 8, textAlign: "center", fontSize: 18, fontWeight: 900 }}>{match.score2 || 0}</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 4 }}>
          <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 800 }}>Winner:</span>
          <div style={{ flex: 1, background: match.winner ? "#10b981" : "var(--bg)", color: match.winner ? "var(--bg)" : "var(--text-muted)", padding: 8, borderRadius: 8, fontWeight: 900, fontSize: 16 }}>
            {match.winner || "TBD"}
          </div>
        </div>
      </div>
      );
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 16 }}><GitMerge size={32} color="#38bdf8" /> Manage Brackets</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {db.sports.map(s => (
              <button
                key={s}
                onClick={() => setBracketSport(s)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  fontWeight: 800,
                  fontSize: 14,
                  border: "none",
                  cursor: "pointer",
                  background: bracketSport === s ? "#8b5cf6" : "var(--panel-bg)",
                  color: bracketSport === s ? "#fff" : "var(--text-muted)",
                  boxShadow: bracketSport === s ? "0 4px 10px rgba(139, 92, 246, 0.3)" : "none",
                  transition: "all 0.2s"
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <button 
              onClick={handleAutoGenerateBracket} 
              style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "2px solid rgba(56,189,248,0.3)", padding: "12px 24px", borderRadius: 12, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 16 }}
            >
              <RefreshCw size={20} /> AUTO-GENERATE
            </button>
            <button onClick={handleSaveBracket} style={{ background: "#38bdf8", color: "var(--bg)", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 16, boxShadow: "0 4px 8px rgba(56,189,248,0.3)" }}>
              <Save size={20} /> SAVE BRACKET
            </button>
          </div>
        </div>

        <div style={{ background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.3)", padding: 20, borderRadius: 12 }}>
          <h3 style={{ margin: "0 0 12px", color: "#8b5cf6", fontSize: 18, fontWeight: 800 }}>⚙️ Semi-Automatic Progression</h3>
          <p style={{ margin: "0 0 8px", color: "var(--text-main)", fontSize: 14, lineHeight: 1.5 }}>
            <strong>1. Initial Setup:</strong> Select which teams face each other in Round 1 (Quarter-Finals or Semi-Finals) and hit SAVE BRACKET.
          </p>
          <p style={{ margin: "0 0 8px", color: "var(--text-main)", fontSize: 14, lineHeight: 1.5 }}>
            <strong>2. Match Score Update:</strong> You don't update scores directly inside the bracket. Instead, go to the <strong>Matches</strong> tab to input stats and points while the game is ongoing.
          </p>
          <p style={{ margin: 0, color: "var(--text-main)", fontSize: 14, lineHeight: 1.5 }}>
            <strong>3. Automatic Progression:</strong> Once a match is saved and a winner is determined, the system automatically advances that winning team to the next slot in the bracket!
          </p>
        </div>

        <div style={{ overflowX: "auto", paddingBottom: 16 }}>
          <div style={{ minWidth: 800, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {/* Quarter Finals */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Quarter Finals</h3>
              {editingBracket?.qf?.map((match, i) => <React.Fragment key={i}>{renderMatchInputs(match, "qf", i)}</React.Fragment>)}
            </div>

            {/* Semi Finals */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "space-around" }}>
              <h3 style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Semi Finals</h3>
              {editingBracket?.sf?.map((match, i) => <React.Fragment key={i}>{renderMatchInputs(match, "sf", i)}</React.Fragment>)}
            </div>

            {/* Final */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
              <h3 style={{ textAlign: "center", color: "#f59e0b", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Final</h3>
              {renderMatchInputs(editingBracket.final, "final", 0)}
              
              <div style={{ marginTop: 24, background: "rgba(245,158,11,0.1)", padding: 16, borderRadius: 8, border: "1px solid rgba(245,158,11,0.3)", textAlign: "center" }}>
                <h4 style={{ margin: "0 0 8px", color: "#f59e0b" }}>Champion</h4>
                <select value={editingBracket.champion || ""} onChange={e => setEditingBracket({...editingBracket, champion: e.target.value})} style={{ width: "100%", background: "var(--bg)", border: "1px solid #f59e0b", color: "var(--text-main)", padding: 8, borderRadius: 4, fontWeight: 800, textAlign: "center" }}>
                  <option value="">Select Champion</option>
                  {editingBracket.final.team1 && <option value={editingBracket.final.team1}>{editingBracket.final.team1}</option>}
                  {editingBracket.final.team2 && <option value={editingBracket.final.team2}>{editingBracket.final.team2}</option>}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsersTab = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))", gap: 24 }}>
      <div style={{ ...card, background: "linear-gradient(135deg, var(--panel-bg) 0%, var(--bg) 100%)", boxShadow: "0 0 25px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}><Shield size={24} color="#f59e0b" /> Add Staff User</h2>
        <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Full Name" style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "12px", color: "var(--text-main)" }} />
          <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="Email Address" style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "12px", color: "var(--text-main)" }} />
          <input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder="Password" style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "12px", color: "var(--text-main)" }} />
          <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as any)} style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "12px", color: "var(--text-main)" }}>
            <option value="TABULATOR">Tabulator</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" style={{ background: "#f59e0b", color: "var(--bg)", border: "none", padding: "12px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>Create User</button>
        </form>
      </div>
      <div style={card}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800 }}>Staff List</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {db.users.map(u => (
            <div key={u.user_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--panel-bg)", padding: 12, borderRadius: 8 }}>
              <div>
                <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                  {u.name} <span style={Badge(u.role === "ADMIN" ? "#f59e0b" : "#38bdf8")}>{u.role}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{u.email}</div>
              </div>
              {u.user_id !== user.user_id && (
                <button onClick={() => { if(window.confirm('Delete user?')) deleteUser(u.user_id); }} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={18} /></button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 24 }}>
      <div style={card}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}>🚀 Add New Sport</h2>
        <form onSubmit={handleAddSport} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input type="text" value={newSportName} onChange={e => setNewSportName(e.target.value)} placeholder="e.g. Swimming, Tennis" style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "12px", color: "var(--text-main)" }} />
          <button type="submit" style={{ background: "#f59e0b", color: "var(--bg)", border: "none", padding: "12px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>Add Sport</button>
        </form>
      </div>
      <div style={card}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}>🕹️ System Sports List</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {db.sports.map(s => (
            <span key={s} style={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", padding: "4px 12px", borderRadius: 16, fontSize: 13 }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>System Activity Log</h2>
          <button onClick={exportData} style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)", padding: "8px 16px", borderRadius: 8, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <Download size={16} /> Export Data (JSON)
          </button>
        </div>
        <div style={{ maxHeight: 500, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {db.activityLogs?.map(log => (
            <div key={log.id} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, borderLeft: "3px solid #38bdf8" }}>
              <div style={{ fontSize: 14 }}>{log.message}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(log.timestamp).toLocaleString()}</div>
            </div>
          ))}
          {(!db.activityLogs || db.activityLogs.length === 0) && <div style={{ color: "var(--text-muted)" }}>No recent activity.</div>}
        </div>
      </div>
    </div>
  );

  const renderRefereesTab = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 32 }}>
      <div style={{ ...card, background: "linear-gradient(135deg, var(--panel-bg) 0%, var(--bg) 100%)", padding: 32, boxShadow: "0 0 25px var(--glow-color), 0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ margin: "0 0 32px", fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 16 }}><ShieldCheck size={32} color="#06b6d4" /> Add New Referee</h2>
        <form onSubmit={handleAddReferee} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: 8 }}>Referee Name</label>
            <input type="text" value={newRefName} onChange={e => setNewRefName(e.target.value)} placeholder="e.g. Pierluigi Collina" style={{ width: "100%", background: "var(--panel-bg)", border: "2px solid var(--border-color)", borderRadius: 12, padding: "16px", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }} />
          </div>
          <div>
            <label style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: 8 }}>Sport</label>
            <select value={newRefSport} onChange={e => setNewRefSport(e.target.value)} style={{ width: "100%", background: "var(--panel-bg)", border: "2px solid var(--border-color)", borderRadius: 12, padding: "16px", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }}>
              {db.sports.map(s => <option key={s} value={s} style={{ color: "#000" }}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: 8 }}>Contact / Info (Optional)</label>
            <input type="text" value={newRefContact} onChange={e => setNewRefContact(e.target.value)} placeholder="e.g. +63 123 456 7890" style={{ width: "100%", background: "var(--panel-bg)", border: "2px solid var(--border-color)", borderRadius: 12, padding: "16px", color: "var(--text-main)", fontSize: 18, fontWeight: 700 }} />
          </div>
          <button type="submit" style={{ background: "#06b6d4", color: "var(--bg)", border: "none", padding: "16px", borderRadius: 12, fontWeight: 900, fontSize: 18, cursor: "pointer", marginTop: 8, boxShadow: "0 8px 16px rgba(6, 182, 212, 0.3)" }}>+ REGISTER REFEREE</button>
        </form>
      </div>
      <div style={{ ...card, padding: 32 }}>
        <h2 style={{ margin: "0 0 32px", fontSize: 24, fontWeight: 900 }}>Referee List</h2>
        <div style={{ maxHeight: 500, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {db.referees?.map(r => (
            <div key={r.referee_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--panel-bg)", padding: 20, borderRadius: 16, border: "1px solid var(--border-color)" }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{r.name}</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>{r.sport} {r.contact && `• ${r.contact}`}</div>
              </div>
              <button onClick={() => { if(window.confirm('Delete referee?')) deleteReferee(r.referee_id); }} style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", cursor: "pointer", padding: 12, borderRadius: 12 }}><Trash2 size={24} /></button>
            </div>
          ))}
          {(!db.referees || db.referees.length === 0) && <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 20 }}>No referees registered yet.</div>}
        </div>
      </div>
    </div>
  );

  // --- Box Score Modal ---
  const renderBoxScoreModal = () => {
    if (!boxScoreMatch) return null;
    const match = db.matches.find(m => m.match_id === boxScoreMatch);
    if (!match) return null;
    const isMens = match.category === "Men's Division";
    const isWomens = match.category === "Women's Division";
    
    // Filter by team and by gender if division is specified
    const t1Players = db.players.filter(p => p.team_id === match.team1_id && (!isMens || p.gender === "Male") && (!isWomens || p.gender === "Female"));
    const t2Players = db.players.filter(p => p.team_id === match.team2_id && (!isMens || p.gender === "Male") && (!isWomens || p.gender === "Female"));
    const sportStats = S_STATS[match.sport as keyof typeof S_STATS] || ["points"];

    const getStat = (playerId: number, statKey: string) => {
      const stat = db.playerStats.find(s => s.match_id === match.match_id && s.player_id === playerId);
      return stat ? (stat as any)[statKey] || 0 : 0;
    };

    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "var(--panel-bg)", border: `1px solid var(--border-color)`, borderRadius: 16, width: "100%", maxWidth: 900, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: 20, borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Box Score: {teamsMap[match.team1_id]?.team_name} vs {teamsMap[match.team2_id]?.team_name}</h3>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button 
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (!printWindow) return;
                  
                  let tableHtml = "";
                  [ { t: teamsMap[match.team1_id], p: t1Players }, { t: teamsMap[match.team2_id], p: t2Players } ].forEach(({ t, p }) => {
                    tableHtml += `
                      <h4 style="margin: 30px 0 10px; font-size: 18px; color: #0f172a; text-transform: uppercase;">${t?.team_name}</h4>
                      <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 20px;">
                        <thead>
                          <tr style="border-bottom: 2px solid #e2e8f0;">
                            <th style="padding: 10px; color: #64748b; font-size: 12px; text-transform: uppercase;">Player</th>
                            ${sportStats.map(st => `<th style="padding: 10px; color: #64748b; font-size: 12px; text-transform: uppercase; text-align: center;">${st.replace("_", " ")}</th>`).join('')}
                          </tr>
                        </thead>
                        <tbody>
                          ${p.map(player => `
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                              <td style="padding: 10px; font-weight: 700; font-size: 14px;">${player.player_name} <span style="color: #94a3b8; font-size: 11px;">#${player.jersey_number}</span></td>
                              ${sportStats.map(st => `<td style="padding: 10px; text-align: center; font-weight: 700;">${getStat(player.player_id, st)}</td>`).join('')}
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    `;
                  });

                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Match Report - ${teamsMap[match.team1_id]?.team_name} vs ${teamsMap[match.team2_id]?.team_name}</title>
                        <style>
                          body { font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a; }
                          @media print { body { padding: 0; } }
                        </style>
                      </head>
                      <body>
                        <div style="max-width: 800px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 16px; padding: 40px;">
                          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase;">OFFICIAL MATCH REPORT</h1>
                            <p style="margin: 8px 0 0; font-size: 16px; color: #64748b; font-weight: 600;">${match.sport.toUpperCase()} ${match.category ? `• ${match.category.toUpperCase()}` : ''}</p>
                            <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">Status: ${match.status.toUpperCase()}</p>
                          </div>
                          
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <div style="text-align: center; flex: 1;">
                              <div style="font-size: 20px; font-weight: 800; color: #64748b;">${teamsMap[match.team1_id]?.team_name}</div>
                              <div style="font-size: 48px; font-weight: 900;">${match.sport !== "Basketball" ? (match.t1_rounds || 0) : match.score_team1}</div>
                              ${match.sport !== "Basketball" ? `<div style="font-size: 14px; color: #64748b; font-weight: 700;">PTS: ${match.score_team1}</div>` : ''}
                            </div>
                            <div style="font-size: 24px; font-weight: 900; color: #94a3b8; padding: 0 20px;">VS</div>
                            <div style="text-align: center; flex: 1;">
                              <div style="font-size: 20px; font-weight: 800; color: #64748b;">${teamsMap[match.team2_id]?.team_name}</div>
                              <div style="font-size: 48px; font-weight: 900;">${match.sport !== "Basketball" ? (match.t2_rounds || 0) : match.score_team2}</div>
                              ${match.sport !== "Basketball" ? `<div style="font-size: 14px; color: #64748b; font-weight: 700;">PTS: ${match.score_team2}</div>` : ''}
                            </div>
                          </div>
                          
                          ${match.winner ? `<div style="text-align: center; margin-bottom: 30px; font-size: 18px; font-weight: 800; color: #10b981;">WINNER: ${match.winner.toUpperCase()}</div>` : ''}
                          
                          ${tableHtml}
                          
                          <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; font-weight: 600;">
                            Generated by Sports Management System • ${new Date().toLocaleString()}
                          </div>
                        </div>
                        <script>
                          setTimeout(() => { window.print(); window.close(); }, 500);
                        </script>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                }}
                style={{ background: "#38bdf8", border: "none", color: "#000", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}
              >
                🖨️ PRINT REPORT
              </button>
              <button onClick={() => setBoxScoreMatch(null)} style={{ background: "transparent", border: "none", color: "var(--text-main)", fontSize: 24, cursor: "pointer" }}>&times;</button>
            </div>
          </div>
          <div style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 30 }}>
            {[ { t: teamsMap[match.team1_id], p: t1Players }, { t: teamsMap[match.team2_id], p: t2Players } ].map(({ t, p }) => (
              <div key={t?.team_id}>
                <h4 style={{ margin: "0 0 16px", fontSize: 18, color: "#38bdf8" }}>{t?.team_name}</h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <th style={{ padding: 8, color: "var(--text-muted)", fontSize: 12 }}>Player</th>
                        {sportStats.map(st => <th key={st} style={{ padding: 8, color: "var(--text-muted)", fontSize: 12, textTransform: "capitalize", textAlign: "center" }}>{st.replace("_", " ")}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {p.map(player => (
                        <tr key={player.player_id} style={{ borderBottom: "1px solid var(--panel-bg)" }}>
                          <td style={{ padding: 8, fontWeight: 700, fontSize: 14 }}>{player.player_name} <span style={{ color: "var(--text-muted)", fontSize: 11 }}>#{player.jersey_number}</span></td>
                          {sportStats.map(st => (
                            <td key={st} style={{ padding: 8, textAlign: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                <button onClick={() => updatePlayerStat(match.match_id, player.player_id, match.sport, st as any, -1)} style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "none", width: 24, height: 24, borderRadius: 4, cursor: "pointer", fontWeight: 900 }}>-</button>
                                <span style={{ width: 20, fontWeight: 800 }}>{getStat(player.player_id, st)}</span>
                                <button onClick={() => updatePlayerStat(match.match_id, player.player_id, match.sport, st as any, 1)} style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", border: "none", width: 24, height: 24, borderRadius: 4, cursor: "pointer", fontWeight: 900 }}>+</button>
                              </div>
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
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1, flexDirection: "row" }}>
      {renderSidebar()}
      
      <div style={{ flex: 1, padding: mob ? "16px" : "32px 48px", overflowY: "auto", height: "100vh", width: mob ? "100%" : "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {mob && (
               <button onClick={() => setIsSidebarOpen(true)} style={{ background: "transparent", border: "none", color: "var(--text-main)", padding: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
                 <Menu size={24} />
               </button>
            )}
            <div>
              <h1 style={{ fontSize: mob ? 24 : 32, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 }}>
                {activeTab === "matches" && "Matches"}
                {activeTab === "teams" && "Teams"}
                {activeTab === "players" && "Players"}
                {activeTab === "referees" && "Referees"}
                {activeTab === "brackets" && "Tournament Brackets"}
                {activeTab === "system" && "Add Sport"}
                {activeTab === "users" && "Admin Users"}
                {activeTab === "activity" && "Activity Logs"}
              </h1>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>Manage your {activeTab} data seamlessly.</p>
            </div>
          </div>
          {!isSidebarOpen && !mob && (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Link to="/" style={{ textDecoration: "none" }}>
                <button style={{ background: "var(--border-color)", color: "var(--text-main)", border: "1px solid var(--border-hover)", padding: "10px 20px", borderRadius: 20, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>View Site</button>
              </Link>
            </div>
          )}
        </div>

        {msg && (
          <div style={{ background: msg.t === "s" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${msg.t === "s" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 12, color: msg.t === "s" ? "#10b981" : "#ef4444", fontSize: 14, marginBottom: 24 }}>
            {msg.t === "s" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />} {msg.m}
          </div>
        )}

        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {activeTab === "matches" && renderMatchesTab()}
          {activeTab === "teams" && renderTeamsTab()}
          {activeTab === "players" && renderPlayersTab()}
          {activeTab === "referees" && renderRefereesTab()}
          {activeTab === "brackets" && renderBracketsTab()}
          {activeTab === "system" && renderSystemTab()}
          {activeTab === "users" && user.role === "ADMIN" && renderUsersTab()}
          {activeTab === "activity" && renderActivityTab()}
        </div>

        {renderBoxScoreModal()}
        {liveControlMatch && <LiveMatchControlModal matchId={liveControlMatch} onClose={() => setLiveControlMatch(null)} />}
      </div>
    </div>
  );
}