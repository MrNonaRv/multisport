import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Trophy, Activity, Users, Calendar, ChevronRight } from "lucide-react";
import { useW, SPORTS, S_ICONS, COLORS } from "../db";
import { useDatabase } from "../context/DatabaseContext";
import { card, Btn, Badge, PP, MiniBar, Donut, OrangeBG, WhiteBG } from "../components/Shared";

export default function Home() {
  const { db } = useDatabase();
  const w = useW();
  const mob = w < 768;

  const live = useMemo(() => db.matches.filter(m => m.status === "live"), [db.matches]);
  const upc = useMemo(() => db.matches.filter(m => m.status === "upcoming").slice(0, 3), [db.matches]);
  const cmp = useMemo(() => db.matches.filter(m => m.status === "completed").slice(-3).reverse(), [db.matches]);

  const gTeam = useMemo(() => (id: number) => db.teams.find(t => t.team_id === id), [db.teams]);

  return (
    <div style={PP}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: mob ? 28 : 36, fontWeight: 900, letterSpacing: -1, background: "linear-gradient(90deg, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Tournament Central
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 15 }}>Live scores, stats, and standings across all sports.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ ...card, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}><Users size={20} /></div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{db.players.length}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>Athletes</div>
            </div>
          </div>
          <div style={{ ...card, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}><Trophy size={20} /></div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{db.teams.length}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>Teams</div>
            </div>
          </div>
        </div>
      </div>

      {live.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444", animation: "pulse 2s infinite" }} />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Live Now</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${mob ? 1 : live.length > 1 ? 2 : 1}, 1fr)`, gap: 16 }}>
            {live.map(m => {
              const t1 = gTeam(m.team1_id);
              const t2 = gTeam(m.team2_id);
              const c = COLORS[m.sport as keyof typeof COLORS] || "#3b82f6";
              return (
                <div key={m.match_id} style={{ ...card, border: `1px solid ${c}80`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -20, right: -20, fontSize: 100, opacity: 0.05 }}>{S_ICONS[m.sport as keyof typeof S_ICONS]}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={Badge(c)}>{m.sport} • {m.game_label}</span>
                    <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}><Activity size={14} /> LIVE</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 4 }}>{t1?.team_name}</div>
                      <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{m.score_team1}</div>
                    </div>
                    <div style={{ padding: "0 24px", color: "#475569", fontWeight: 800, fontSize: 16 }}>VS</div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 4 }}>{t2?.team_name}</div>
                      <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{m.score_team2}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16, marginBottom: 32 }}>
        {SPORTS.map(s => {
          const c = COLORS[s as keyof typeof COLORS] || "#3b82f6";
          const ic = S_ICONS[s as keyof typeof S_ICONS] || "🏅";
          const tCount = db.teams.filter(t => t.sport === s).length;
          const pCount = db.players.filter(p => p.sport === s).length;
          
          return (
            <Link key={s} to={`/sport/${s.toLowerCase().split(" ").join("-")}`} style={{ textDecoration: "none" }}>
              <div style={{ ...card, display: "flex", alignItems: "center", gap: 16, transition: "transform 0.2s, border-color 0.2s", cursor: "pointer", border: "1px solid #1e3a5f" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = c; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#1e3a5f"; }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: `${c}20`, color: c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                  {ic}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{s}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", display: "flex", gap: 12 }}>
                    <span>{tCount} Teams</span>
                    <span>{pCount} Athletes</span>
                  </div>
                </div>
                <ChevronRight color="#475569" />
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 24, marginBottom: 32 }}>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><Calendar size={18} color="#38bdf8" /> Upcoming Matches</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {!upc.length && <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: 20 }}>No upcoming matches scheduled.</div>}
            {upc.map(m => (
              <div key={m.match_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#0a1628", borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{S_ICONS[m.sport as keyof typeof S_ICONS]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{gTeam(m.team1_id)?.team_name} vs {gTeam(m.team2_id)?.team_name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{m.sport} • {m.match_date}</div>
                  </div>
                </div>
                <span style={Badge("#f59e0b")}>{m.game_label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><Trophy size={18} color="#10b981" /> Recent Results</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {!cmp.length && <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: 20 }}>No completed matches yet.</div>}
            {cmp.map(m => (
              <div key={m.match_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#0a1628", borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{S_ICONS[m.sport as keyof typeof S_ICONS]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
                      <span style={{ color: m.winner === gTeam(m.team1_id)?.team_name ? "#10b981" : "#e2e8f0" }}>{gTeam(m.team1_id)?.team_name}</span> vs <span style={{ color: m.winner === gTeam(m.team2_id)?.team_name ? "#10b981" : "#e2e8f0" }}>{gTeam(m.team2_id)?.team_name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{m.sport} • {m.score_team1} - {m.score_team2}</div>
                  </div>
                </div>
                <span style={Badge("#1e3a5f")}>{m.game_label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...card, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, display: "flex", alignItems: "center", gap: 10 }}><Trophy size={22} color="#f59e0b" /> Tournament Brackets</h3>
          <Link to="/sport/basketball" style={{ fontSize: 12, color: "#38bdf8", fontWeight: 700, textDecoration: "none" }}>View All Brackets</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: 16 }}>
          {db.brackets.slice(0, 3).map(b => (
            <div key={b.sport} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>{b.sport}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: b.champion === b.final.team1 ? "#10b981" : "#fff" }}>{b.final.team1}</span>
                    {b.champion === b.final.team1 && <span style={{ fontSize: 8, background: "#10b981", color: "#fff", padding: "1px 4px", borderRadius: 3, fontWeight: 900 }}>W</span>}
                    {b.champion !== b.final.team1 && b.champion && <span style={{ fontSize: 8, background: "#ef4444", color: "#fff", padding: "1px 4px", borderRadius: 3, fontWeight: 900 }}>L</span>}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 900 }}>{b.final.score1}</span>
                </div>
                <div style={{ fontSize: 10, color: "#475569", textAlign: "center" }}>VS</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: b.champion === b.final.team2 ? "#10b981" : "#fff" }}>{b.final.team2}</span>
                    {b.champion === b.final.team2 && <span style={{ fontSize: 8, background: "#10b981", color: "#fff", padding: "1px 4px", borderRadius: 3, fontWeight: 900 }}>W</span>}
                    {b.champion !== b.final.team2 && b.champion && <span style={{ fontSize: 8, background: "#ef4444", color: "#fff", padding: "1px 4px", borderRadius: 3, fontWeight: 900 }}>L</span>}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 900 }}>{b.final.score2}</span>
                </div>
              </div>
              <Link to={`/sport/${b.sport.toLowerCase().split(" ").join("-")}`} style={{ display: "block", marginTop: 16, textAlign: "center", fontSize: 11, fontWeight: 800, color: "#38bdf8", textDecoration: "none", background: "rgba(56, 189, 248, 0.1)", padding: "6px 0", borderRadius: 6 }}>View Full Bracket</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
