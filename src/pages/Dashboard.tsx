import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useDatabase } from "../context/DatabaseContext";
import { Navigate, Link } from "react-router-dom";
import { Activity, Save, RefreshCw, CheckCircle2, AlertCircle, PlusCircle, Users, UserPlus, Trash2, Edit, BarChart2, Download, Shield, GitMerge } from "lucide-react";
import { card, PP, Badge } from "../components/Shared";
import LiveMatchControlModal from "../components/LiveMatchControlModal";
import { Match, Player, Team, User, Bracket, BracketMatch } from "../types";
import { SPORTS, S_STATS } from "../db";

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
    <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={Badge(m.status === "live" ? "#ef4444" : m.status === "completed" ? "#10b981" : "#94a3b8")}>
          {m.status.toUpperCase()}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <select 
            value={m.status}
            onChange={e => handleStatusChange(m.match_id, e.target.value as any, m)}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 4, padding: "4px 8px", fontSize: 12 }}
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
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 8 }}>{t1?.team_name}</div>
          {isEditing ? (
            <input type="number" value={s1} onChange={e => setS1(parseInt(e.target.value) || 0)} style={{ width: 60, background: "#020917", border: "2px solid #38bdf8", borderRadius: 8, padding: 8, color: "#fff", fontSize: 24, fontWeight: 900, textAlign: "center" }} />
          ) : (
            <div style={{ fontSize: 32, fontWeight: 900 }}>{m.score_team1}</div>
          )}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#1e3a5f" }}>VS</div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 8 }}>{t2?.team_name}</div>
          {isEditing ? (
            <input type="number" value={s2} onChange={e => setS2(parseInt(e.target.value) || 0)} style={{ width: 60, background: "#020917", border: "2px solid #38bdf8", borderRadius: 8, padding: 8, color: "#fff", fontSize: 24, fontWeight: 900, textAlign: "center" }} />
          ) : (
            <div style={{ fontSize: 32, fontWeight: 900 }}>{m.score_team2}</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {isEditing ? (
          <>
            <button onClick={() => handleSaveMatchScore(m.match_id)} style={{ flex: 1, background: "#10b981", color: "#fff", border: "none", padding: "8px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>Save Score</button>
            <button onClick={() => setEditingMatch(null)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid #1e3a5f", padding: "8px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setLiveControlMatch(m.match_id)} style={{ flex: 1, background: "#ef4444", color: "#fff", border: "none", padding: "8px", borderRadius: 8, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Activity size={16} /> Live Control</button>
            <button onClick={() => { setEditingMatch(m.match_id); setS1(m.score_team1); setS2(m.score_team2); }} style={{ flex: 1, background: "#1e3a5f", color: "#38bdf8", border: "none", padding: "8px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>Edit Score</button>
            <button onClick={() => setBoxScoreMatch(m.match_id)} style={{ flex: 1, background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)", padding: "8px", borderRadius: 8, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><BarChart2 size={16} /> Box Score</button>
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
    updateBracket
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<"matches" | "teams" | "players" | "users" | "activity" | "brackets">("matches");
  const [msg, setMsg] = useState<{ t: "s" | "e", m: string } | null>(null);

  // Match State
  const [matchSportFilter, setMatchSportFilter] = useState(SPORTS[0]);
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [s1, setS1] = useState(0);
  const [s2, setS2] = useState(0);
  const [boxScoreMatch, setBoxScoreMatch] = useState<number | null>(null);
  const [liveControlMatch, setLiveControlMatch] = useState<number | null>(null);

  // Add Team State
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamSport, setNewTeamSport] = useState(SPORTS[0]);
  const [newTeamCoach, setNewTeamCoach] = useState("");

  // Add Player State
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerTeam, setNewPlayerTeam] = useState("");
  const [newPlayerJersey, setNewPlayerJersey] = useState("");

  // Add User State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"ADMIN" | "TABULATOR">("TABULATOR");

  // Bracket State
  const [bracketSport, setBracketSport] = useState(SPORTS[0]);
  const [editingBracket, setEditingBracket] = useState<Bracket | null>(null);

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
    addTeam({ team_name: newTeamName, sport: newTeamSport, coach_name: newTeamCoach });
    addActivityLog(`${user.name} added a new team: ${newTeamName} (${newTeamSport})`);
    setNewTeamName(""); setNewTeamCoach("");
    showMsg("s", "Team added successfully!");
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !newPlayerTeam || !newPlayerJersey) return showMsg("e", "Please fill in all player fields.");
    const teamId = parseInt(newPlayerTeam);
    const team = db.teams.find(t => t.team_id === teamId);
    if (!team) return;
    addPlayer({ player_name: newPlayerName, team_id: teamId, sport: team.sport, jersey_number: parseInt(newPlayerJersey) });
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

  const renderTabs = () => (
    <div style={{ display: "flex", gap: 16, marginBottom: 24, overflowX: "auto", paddingBottom: 8 }}>
      {["matches", "teams", "players", "brackets", "activity"].concat(user.role === "ADMIN" ? ["users"] : []).map(tab => (
        <button 
          key={tab}
          onClick={() => setActiveTab(tab as any)}
          style={{ 
            background: activeTab === tab ? "#38bdf8" : "rgba(255,255,255,0.05)", 
            color: activeTab === tab ? "#020917" : "#fff", 
            border: "none", 
            padding: "10px 20px", 
            borderRadius: 8, 
            fontWeight: 800, 
            cursor: "pointer",
            textTransform: "uppercase",
            fontSize: 13,
            transition: "all 0.2s"
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const renderMatchesTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Manage Matches</h2>
        <select 
          value={matchSportFilter} 
          onChange={e => setMatchSportFilter(e.target.value)}
          style={{ background: "#020917", border: "1px solid #1e3a5f", borderRadius: 8, padding: "8px 16px", color: "#fff", outline: "none" }}
        >
          {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

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
        {filteredMatches.length === 0 && <div style={{ color: "#94a3b8", padding: 20 }}>No matches found for this sport.</div>}
      </div>
    </div>
  );

  const renderTeamsTab = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))", gap: 24 }}>
      <div style={{ ...card, background: "linear-gradient(135deg, #0f2040 0%, #020917 100%)" }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}><Users size={24} color="#38bdf8" /> Add New Team</h2>
        <form onSubmit={handleAddTeam} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Team Name" style={{ width: "100%", background: "#020917", border: "1px solid #1e3a5f", borderRadius: 8, padding: "12px", color: "#fff" }} />
          <select value={newTeamSport} onChange={e => setNewTeamSport(e.target.value)} style={{ width: "100%", background: "#020917", border: "1px solid #1e3a5f", borderRadius: 8, padding: "12px", color: "#fff" }}>
            {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="text" value={newTeamCoach} onChange={e => setNewTeamCoach(e.target.value)} placeholder="Coach Name" style={{ width: "100%", background: "#020917", border: "1px solid #1e3a5f", borderRadius: 8, padding: "12px", color: "#fff" }} />
          <button type="submit" style={{ background: "#38bdf8", color: "#020917", border: "none", padding: "12px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>Add Team</button>
        </form>
      </div>
      <div style={card}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800 }}>Team List</h2>
        <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {db.teams.map(t => (
            <div key={t.team_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 8 }}>
              <div>
                <div style={{ fontWeight: 800 }}>{t.team_name}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{t.sport} • Coach: {t.coach_name}</div>
              </div>
              <button onClick={() => { if(window.confirm('Delete team?')) deleteTeam(t.team_id); }} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlayersTab = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))", gap: 24 }}>
      <div style={{ ...card, background: "linear-gradient(135deg, #0f2040 0%, #020917 100%)" }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}><UserPlus size={24} color="#10b981" /> Add New Player</h2>
        <form onSubmit={handleAddPlayer} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input type="text" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="Player Name" style={{ width: "100%", background: "#020917", border: "1px solid #1e3a5f", borderRadius: 8, padding: "12px", color: "#fff" }} />
          <select value={newPlayerTeam} onChange={e => setNewPlayerTeam(e.target.value)} style={{ width: "100%", background: "#020917", border: "1px solid #1e3a5f", borderRadius: 8, padding: "12px", color: "#fff" }}>
            <option value="" disabled>Select a team...</option>
            {db.teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name} ({t.sport})</option>)}
          </select>
          <input type="number" value={newPlayerJersey} onChange={e => setNewPlayerJersey(e.target.value)} placeholder="Jersey Number" style={{ width: "100%", background: "#020917", border: "1px solid #1e3a5f", borderRadius: 8, padding: "12px", color: "#fff" }} />
          <button type="submit" style={{ background: "#10b981", color: "#020917", border: "none", padding: "12px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>Add Player</button>
        </form>
      </div>
      <div style={card}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800 }}>Player List</h2>
        <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {db.players.map(p => (
            <div key={p.player_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 8 }}>
              <div>
                <div style={{ fontWeight: 800 }}>{p.player_name} <span style={{ color: "#94a3b8", fontSize: 12 }}>#{p.jersey_number}</span></div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{teamsMap[p.team_id]?.team_name} • {p.sport}</div>
              </div>
              <button onClick={() => { if(window.confirm('Delete player?')) deletePlayer(p.player_id); }} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBracketsTab = () => {
    if (!editingBracket) return null;
    const teamsForSport = db.teams.filter(t => t.sport === bracketSport);

    const renderMatchInputs = (match: BracketMatch, round: "qf" | "sf" | "final", index: number) => (
      <div style={{ background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 8, display: "flex", flexDirection: "column", gap: 8, border: "1px solid #1e3a5f" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={match.team1} onChange={e => updateBracketMatch(round, index, "team1", e.target.value)} style={{ flex: 1, background: "#020917", border: "1px solid #1e3a5f", color: "#fff", padding: 4, borderRadius: 4 }}>
            <option value="">Select Team 1</option>
            {teamsForSport.map(t => <option key={t.team_id} value={t.team_name}>{t.team_name}</option>)}
          </select>
          <input type="number" value={match.score1 || 0} onChange={e => updateBracketMatch(round, index, "score1", parseInt(e.target.value) || 0)} style={{ width: 50, background: "#020917", border: "1px solid #1e3a5f", color: "#fff", padding: 4, borderRadius: 4, textAlign: "center" }} />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={match.team2} onChange={e => updateBracketMatch(round, index, "team2", e.target.value)} style={{ flex: 1, background: "#020917", border: "1px solid #1e3a5f", color: "#fff", padding: 4, borderRadius: 4 }}>
            <option value="">Select Team 2</option>
            {teamsForSport.map(t => <option key={t.team_id} value={t.team_name}>{t.team_name}</option>)}
          </select>
          <input type="number" value={match.score2 || 0} onChange={e => updateBracketMatch(round, index, "score2", parseInt(e.target.value) || 0)} style={{ width: 50, background: "#020917", border: "1px solid #1e3a5f", color: "#fff", padding: 4, borderRadius: 4, textAlign: "center" }} />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Winner:</span>
          <select value={match.winner || ""} onChange={e => updateBracketMatch(round, index, "winner", e.target.value)} style={{ flex: 1, background: "#10b981", border: "none", color: "#020917", padding: 4, borderRadius: 4, fontWeight: 800 }}>
            <option value="">None</option>
            {match.team1 && <option value={match.team1}>{match.team1}</option>}
            {match.team2 && <option value={match.team2}>{match.team2}</option>}
          </select>
        </div>
      </div>
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}><GitMerge size={24} color="#38bdf8" /> Manage Brackets</h2>
          <div style={{ display: "flex", gap: 12 }}>
            <select 
              value={bracketSport} 
              onChange={e => setBracketSport(e.target.value)}
              style={{ background: "#020917", border: "1px solid #1e3a5f", borderRadius: 8, padding: "8px 16px", color: "#fff", outline: "none" }}
            >
              {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleSaveBracket} style={{ background: "#38bdf8", color: "#020917", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Save size={16} /> Save Bracket
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, overflowX: "auto" }}>
          {/* Quarter Finals */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Quarter Finals</h3>
            {editingBracket.qf.map((match, i) => <React.Fragment key={i}>{renderMatchInputs(match, "qf", i)}</React.Fragment>)}
          </div>

          {/* Semi Finals */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "space-around" }}>
            <h3 style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Semi Finals</h3>
            {editingBracket.sf.map((match, i) => <React.Fragment key={i}>{renderMatchInputs(match, "sf", i)}</React.Fragment>)}
          </div>

          {/* Final */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
            <h3 style={{ textAlign: "center", color: "#f59e0b", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Final</h3>
            {renderMatchInputs(editingBracket.final, "final", 0)}
            
            <div style={{ marginTop: 24, background: "rgba(245,158,11,0.1)", padding: 16, borderRadius: 8, border: "1px solid rgba(245,158,11,0.3)", textAlign: "center" }}>
              <h4 style={{ margin: "0 0 8px", color: "#f59e0b" }}>Champion</h4>
              <select value={editingBracket.champion || ""} onChange={e => setEditingBracket({...editingBracket, champion: e.target.value})} style={{ width: "100%", background: "#020917", border: "1px solid #f59e0b", color: "#fff", padding: 8, borderRadius: 4, fontWeight: 800, textAlign: "center" }}>
                <option value="">Select Champion</option>
                {editingBracket.final.team1 && <option value={editingBracket.final.team1}>{editingBracket.final.team1}</option>}
                {editingBracket.final.team2 && <option value={editingBracket.final.team2}>{editingBracket.final.team2}</option>}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsersTab = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))", gap: 24 }}>
      <div style={{ ...card, background: "linear-gradient(135deg, #0f2040 0%, #020917 100%)" }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}><Shield size={24} color="#f59e0b" /> Add Staff User</h2>
        <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Full Name" style={{ width: "100%", background: "#020917", border: "1px solid #1e3a5f", borderRadius: 8, padding: "12px", color: "#fff" }} />
          <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="Email Address" style={{ width: "100%", background: "#020917", border: "1px solid #1e3a5f", borderRadius: 8, padding: "12px", color: "#fff" }} />
          <input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder="Password" style={{ width: "100%", background: "#020917", border: "1px solid #1e3a5f", borderRadius: 8, padding: "12px", color: "#fff" }} />
          <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as any)} style={{ width: "100%", background: "#020917", border: "1px solid #1e3a5f", borderRadius: 8, padding: "12px", color: "#fff" }}>
            <option value="TABULATOR">Tabulator</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" style={{ background: "#f59e0b", color: "#020917", border: "none", padding: "12px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>Create User</button>
        </form>
      </div>
      <div style={card}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800 }}>Staff List</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {db.users.map(u => (
            <div key={u.user_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 8 }}>
              <div>
                <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                  {u.name} <span style={Badge(u.role === "ADMIN" ? "#f59e0b" : "#38bdf8")}>{u.role}</span>
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{u.email}</div>
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
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(log.timestamp).toLocaleString()}</div>
            </div>
          ))}
          {(!db.activityLogs || db.activityLogs.length === 0) && <div style={{ color: "#94a3b8" }}>No recent activity.</div>}
        </div>
      </div>
    </div>
  );

  // --- Box Score Modal ---
  const renderBoxScoreModal = () => {
    if (!boxScoreMatch) return null;
    const match = db.matches.find(m => m.match_id === boxScoreMatch);
    if (!match) return null;
    const t1Players = db.players.filter(p => p.team_id === match.team1_id);
    const t2Players = db.players.filter(p => p.team_id === match.team2_id);
    const sportStats = S_STATS[match.sport as keyof typeof S_STATS] || ["points"];

    const getStat = (playerId: number, statKey: string) => {
      const stat = db.playerStats.find(s => s.match_id === match.match_id && s.player_id === playerId);
      return stat ? (stat as any)[statKey] || 0 : 0;
    };

    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#0f2040", border: `1px solid #1e3a5f`, borderRadius: 16, width: "100%", maxWidth: 900, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: 20, borderBottom: "1px solid #1e3a5f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Box Score: {teamsMap[match.team1_id]?.team_name} vs {teamsMap[match.team2_id]?.team_name}</h3>
            <button onClick={() => setBoxScoreMatch(null)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}>&times;</button>
          </div>
          <div style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 30 }}>
            {[ { t: teamsMap[match.team1_id], p: t1Players }, { t: teamsMap[match.team2_id], p: t2Players } ].map(({ t, p }) => (
              <div key={t?.team_id}>
                <h4 style={{ margin: "0 0 16px", fontSize: 18, color: "#38bdf8" }}>{t?.team_name}</h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <th style={{ padding: 8, color: "#94a3b8", fontSize: 12 }}>Player</th>
                        {sportStats.map(st => <th key={st} style={{ padding: 8, color: "#94a3b8", fontSize: 12, textTransform: "capitalize", textAlign: "center" }}>{st.replace("_", " ")}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {p.map(player => (
                        <tr key={player.player_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: 8, fontWeight: 700, fontSize: 14 }}>{player.player_name} <span style={{ color: "#94a3b8", fontSize: 11 }}>#{player.jersey_number}</span></td>
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
    <div style={PP}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 4px", letterSpacing: -1 }}>Staff Dashboard</h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>Welcome back, <span style={{ color: "#38bdf8", fontWeight: 700 }}>{user.name}</span>.</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8", padding: "8px 16px", borderRadius: 20, fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>
            {user.role} Account
          </div>
          <Link to="/" style={{ textDecoration: "none" }}>
            <button style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px 16px", borderRadius: 20, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>View Site</button>
          </Link>
          <button onClick={logout} style={{ background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", padding: "8px 16px", borderRadius: 20, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      {msg && (
        <div style={{ background: msg.t === "s" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${msg.t === "s" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 12, color: msg.t === "s" ? "#10b981" : "#ef4444", fontSize: 14, marginBottom: 24 }}>
          {msg.t === "s" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />} {msg.m}
        </div>
      )}

      {renderTabs()}

      {activeTab === "matches" && renderMatchesTab()}
      {activeTab === "teams" && renderTeamsTab()}
      {activeTab === "players" && renderPlayersTab()}
      {activeTab === "brackets" && renderBracketsTab()}
      {activeTab === "users" && user.role === "ADMIN" && renderUsersTab()}
      {activeTab === "activity" && renderActivityTab()}

      {renderBoxScoreModal()}
      {liveControlMatch && <LiveMatchControlModal matchId={liveControlMatch} onClose={() => setLiveControlMatch(null)} />}
    </div>
  );
}