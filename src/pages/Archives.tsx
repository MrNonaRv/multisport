import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDatabase } from "../context/DatabaseContext";
import { S_ICONS } from "../db";
import { Badge, PP, card } from "../components/Shared";
import { LayoutGrid, Calendar, ChevronRight } from "lucide-react";

export default function Archives() {
  const { db } = useDatabase();
  const [sportFilter, setSportFilter] = useState("All");

  const completedMatches = useMemo(() => {
    let mList = db.matches.filter(m => m.status === "completed").reverse();
    if (sportFilter !== "All") mList = mList.filter(m => m.sport === sportFilter);
    return mList;
  }, [db.matches, sportFilter]);

  const gTeam = useMemo(() => (id: number) => db.teams.find(t => t.team_id === id), [db.teams]);

  return (
    <div style={PP}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1, display: "flex", alignItems: "center", gap: 10 }}><Calendar size={28} color="#38bdf8" /> Game Archives</h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 16 }}>View past match results and histories.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        <button 
          onClick={() => setSportFilter("All")}
          style={{ background: sportFilter === "All" ? "#38bdf8" : "var(--panel-bg)", color: sportFilter === "All" ? "#000" : "var(--text-main)", border: `1px solid ${sportFilter === "All" ? "#38bdf8" : "var(--border-color)"}`, padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontWeight: 800 }}
        >
          All
        </button>
        {db.sports.map(s => (
          <button 
            key={s}
            onClick={() => setSportFilter(s)}
            style={{ background: sportFilter === s ? "#38bdf8" : "var(--panel-bg)", color: sportFilter === s ? "#000" : "var(--text-main)", border: `1px solid ${sportFilter === s ? "#38bdf8" : "var(--border-color)"}`, padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontWeight: 800 }}
          >
            {s}
          </button>
        ))}
      </div>

      {completedMatches.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--panel-bg)", borderRadius: 16, border: "1px dashed var(--border-color)" }}>
          <LayoutGrid size={48} color="var(--border-color)" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>No Completed Games</h3>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>No past games match your filters.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {completedMatches.map(m => (
            <Link key={m.match_id} to={`/sport/${m.sport.toLowerCase().split(" ").join("-")}?match=${m.match_id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ ...card, padding: 20, background: "var(--panel-bg)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border-color)", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 12, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    {S_ICONS[m.sport as keyof typeof S_ICONS] || "🏅"}
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={Badge("var(--border-color)")}>{m.sport}</span>
                      {m.category && <span style={Badge("var(--border-color)")}>{m.category}</span>}
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>{m.game_label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>• {m.match_date}</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: m.winner === gTeam(m.team1_id)?.team_name ? "#10b981" : "var(--text-main)" }}>
                        {gTeam(m.team1_id)?.team_name} ({(m.sport !== "Basketball") ? m.t1_rounds : m.score_team1})
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: 16 }}>vs</span>
                      <span style={{ color: m.winner === gTeam(m.team2_id)?.team_name ? "#10b981" : "var(--text-main)" }}>
                        {gTeam(m.team2_id)?.team_name} ({(m.sport !== "Basketball") ? m.t2_rounds : m.score_team2})
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight color="var(--border-hover)" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
