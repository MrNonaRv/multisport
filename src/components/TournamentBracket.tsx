import React, { useState } from 'react';
import { Bracket, BracketMatch, Match } from '../types';
import { Trophy, Check, Calendar, Zap, Play, Award, Sparkles, X, ChevronRight, Clock } from 'lucide-react';

export interface TournamentBracketProps {
  bracket: Bracket;
  sport: string;
  isEditing?: boolean;
  availableTeams?: string[];
  matches?: Match[];
  onMatchUpdate?: (round: "qf" | "sf" | "final", index: number, field: keyof BracketMatch, value: any) => void;
  onSetWinner?: (round: "qf" | "sf" | "final", index: number, winner: string) => void;
  onChampionUpdate?: (winner: string) => void;
  onScheduleMatch?: (round: "qf" | "sf" | "final", index: number, team1: string, team2: string) => void;
  mob?: boolean;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ 
  bracket, 
  sport, 
  isEditing = false, 
  availableTeams = [],
  matches = [],
  onMatchUpdate,
  onSetWinner,
  onChampionUpdate,
  onScheduleMatch,
  mob = false
}) => {
  const [selectedMatchInfo, setSelectedMatchInfo] = useState<{
    roundName: string;
    match: BracketMatch;
    round: "qf" | "sf" | "final";
    index: number;
    linkedMatch?: Match;
  } | null>(null);

  const [mobileRoundTab, setMobileRoundTab] = useState<"qf" | "sf" | "final">("qf");

  // Helper to find a linked match from db.matches
  const findLinkedMatch = (team1: string, team2: string) => {
    if (!team1 || !team2 || !matches.length) return undefined;
    const t1 = team1.trim().toLowerCase();
    const t2 = team2.trim().toLowerCase();
    return matches.find(m => {
      if (m.sport?.toLowerCase() !== sport.toLowerCase()) return false;
      const m1 = (m as any).team1_name?.trim().toLowerCase() || "";
      const m2 = (m as any).team2_name?.trim().toLowerCase() || "";
      // or check if IDs match team names if names are mapped in matches
      return (m1 === t1 && m2 === t2) || (m1 === t2 && m2 === t1);
    });
  };

  const getRoundLabel = (round: "qf" | "sf" | "final", index: number) => {
    if (round === "final") return "Championship Final";
    if (round === "sf") return `Semi-Final ${index + 1}`;
    return `Quarter-Final ${index + 1}`;
  };

  const renderMatch = (match: BracketMatch, round: "qf" | "sf" | "final", index: number) => {
    const isFinal = round === "final";
    const hasWinner = !!match.winner;
    const team1IsWinner = hasWinner && match.winner === match.team1;
    const team2IsWinner = hasWinner && match.winner === match.team2;
    const redCorner = (sport === "Arnis" || sport === "Taekwondo") ? "RED" : "";
    const blueCorner = (sport === "Arnis" || sport === "Taekwondo") ? "BLUE" : "";
    const roundName = getRoundLabel(round, index);

    // Look for matching live or completed game in matches
    const linkedMatch = findLinkedMatch(match.team1, match.team2);
    const isLive = linkedMatch?.status === "live";

    // Auto-advance helper if scores differ and no winner is chosen yet
    const hasScoreDiff = typeof match.score1 === "number" && typeof match.score2 === "number" && match.score1 !== match.score2;
    const scoreLeader = hasScoreDiff ? (match.score1! > match.score2! ? match.team1 : match.team2) : "";

    // In edit mode
    if (isEditing && onMatchUpdate) {
      return (
        <div 
          key={`${round}-${index}`}
          id={`bracket-match-edit-${round}-${index}`}
          style={{
            background: isFinal ? "#fff7ed" : "#ffffff",
            padding: 16,
            borderRadius: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            border: isFinal ? "2px solid #f97316" : "1px solid #cbd5e1",
            boxShadow: isFinal ? "0 10px 25px -5px rgba(249, 115, 22, 0.2)" : "0 4px 12px rgba(0,0,0,0.06)",
            color: "#1f2937",
            position: "relative",
            width: isFinal ? 280 : 250,
            zIndex: 2,
            boxSizing: "border-box"
          }}
        >
          {/* Header Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: isFinal ? "#ea580c" : "#64748b", letterSpacing: 0.5 }}>
              {roundName}
            </span>
            {hasWinner && (
              <span style={{ fontSize: 10, fontWeight: 900, background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: 4 }}>
                WINNER SET
              </span>
            )}
            {!hasWinner && isLive && (
              <span style={{ fontSize: 10, fontWeight: 900, background: "#fee2e2", color: "#dc2626", padding: "2px 6px", borderRadius: 4, display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#dc2626", display: "inline-block" }}></span> LIVE
              </span>
            )}
          </div>

          {/* Team 1 Control Row */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {redCorner && <span style={{ fontSize: 9, fontWeight: 900, color: "#ef4444" }}>RED CORNER</span>}
              {match.team1 && onSetWinner && (
                <button
                  type="button"
                  id={`btn-winner-${round}-${index}-team1`}
                  onClick={() => onSetWinner(round, index, team1IsWinner ? "" : match.team1)}
                  title={team1IsWinner ? "Click to clear winner" : "Set as Winner & Advance"}
                  style={{
                    marginLeft: "auto",
                    background: team1IsWinner ? "#10b981" : "#f1f5f9",
                    color: team1IsWinner ? "#ffffff" : "#475569",
                    border: team1IsWinner ? "1px solid #059669" : "1px solid #cbd5e1",
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontSize: 10,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    transition: "all 0.15s ease"
                  }}
                >
                  <Trophy size={11} /> {team1IsWinner ? "WINNER" : "ADVANCE"}
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {availableTeams.length > 0 ? (
                <select
                  value={match.team1 || ""}
                  onChange={e => onMatchUpdate(round, index, "team1", e.target.value)}
                  style={{
                    flex: 1,
                    background: team1IsWinner ? "#ecfdf5" : "#f8fafc",
                    border: team1IsWinner ? "1.5px solid #10b981" : "1px solid #cbd5e1",
                    borderRadius: 8,
                    padding: "6px 8px",
                    fontSize: 13,
                    fontWeight: 800,
                    color: team1IsWinner ? "#065f46" : "#1e293b",
                    outline: "none",
                    minWidth: 0
                  }}
                >
                  <option value="">-- Select Team 1 --</option>
                  {match.team1 && !availableTeams.includes(match.team1) && (
                    <option value={match.team1}>{match.team1} (Custom)</option>
                  )}
                  {availableTeams.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={match.team1 || ""}
                  onChange={e => onMatchUpdate(round, index, "team1", e.target.value)}
                  placeholder="Team 1"
                  style={{
                    flex: 1,
                    background: team1IsWinner ? "#ecfdf5" : "#f8fafc",
                    border: team1IsWinner ? "1.5px solid #10b981" : "1px solid #cbd5e1",
                    borderRadius: 8,
                    padding: "6px 8px",
                    fontSize: 13,
                    fontWeight: 800,
                    color: team1IsWinner ? "#065f46" : "#1e293b",
                    outline: "none"
                  }}
                />
              )}

              {/* Score 1 Input */}
              <input
                type="number"
                min="0"
                value={match.score1 ?? 0}
                onChange={e => onMatchUpdate(round, index, "score1", parseInt(e.target.value) || 0)}
                title="Team 1 Score"
                placeholder="0"
                style={{
                  width: 44,
                  textAlign: "center",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  padding: "6px 4px",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#0f172a",
                  outline: "none"
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: 11, fontWeight: 900, color: "#94a3b8", margin: "-2px 0" }}>VS</div>

          {/* Team 2 Control Row */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {blueCorner && <span style={{ fontSize: 9, fontWeight: 900, color: "#3b82f6" }}>BLUE CORNER</span>}
              {match.team2 && onSetWinner && (
                <button
                  type="button"
                  id={`btn-winner-${round}-${index}-team2`}
                  onClick={() => onSetWinner(round, index, team2IsWinner ? "" : match.team2)}
                  title={team2IsWinner ? "Click to clear winner" : "Set as Winner & Advance"}
                  style={{
                    marginLeft: "auto",
                    background: team2IsWinner ? "#10b981" : "#f1f5f9",
                    color: team2IsWinner ? "#ffffff" : "#475569",
                    border: team2IsWinner ? "1px solid #059669" : "1px solid #cbd5e1",
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontSize: 10,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    transition: "all 0.15s ease"
                  }}
                >
                  <Trophy size={11} /> {team2IsWinner ? "WINNER" : "ADVANCE"}
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {availableTeams.length > 0 ? (
                <select
                  value={match.team2 || ""}
                  onChange={e => onMatchUpdate(round, index, "team2", e.target.value)}
                  style={{
                    flex: 1,
                    background: team2IsWinner ? "#ecfdf5" : "#f8fafc",
                    border: team2IsWinner ? "1.5px solid #10b981" : "1px solid #cbd5e1",
                    borderRadius: 8,
                    padding: "6px 8px",
                    fontSize: 13,
                    fontWeight: 800,
                    color: team2IsWinner ? "#065f46" : "#1e293b",
                    outline: "none",
                    minWidth: 0
                  }}
                >
                  <option value="">-- Select Team 2 --</option>
                  {match.team2 && !availableTeams.includes(match.team2) && (
                    <option value={match.team2}>{match.team2} (Custom)</option>
                  )}
                  {availableTeams.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={match.team2 || ""}
                  onChange={e => onMatchUpdate(round, index, "team2", e.target.value)}
                  placeholder="Team 2"
                  style={{
                    flex: 1,
                    background: team2IsWinner ? "#ecfdf5" : "#f8fafc",
                    border: team2IsWinner ? "1.5px solid #10b981" : "1px solid #cbd5e1",
                    borderRadius: 8,
                    padding: "6px 8px",
                    fontSize: 13,
                    fontWeight: 800,
                    color: team2IsWinner ? "#065f46" : "#1e293b",
                    outline: "none"
                  }}
                />
              )}

              {/* Score 2 Input */}
              <input
                type="number"
                min="0"
                value={match.score2 ?? 0}
                onChange={e => onMatchUpdate(round, index, "score2", parseInt(e.target.value) || 0)}
                title="Team 2 Score"
                placeholder="0"
                style={{
                  width: 44,
                  textAlign: "center",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  padding: "6px 4px",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#0f172a",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Quick Action Footer */}
          <div style={{ display: "flex", gap: 6, marginTop: 4, paddingTop: 6, borderTop: "1px solid #f1f5f9" }}>
            {onScheduleMatch && (
              <button
                type="button"
                id={`btn-schedule-${round}-${index}`}
                onClick={() => onScheduleMatch(round, index, match.team1 || "", match.team2 || "")}
                style={{
                  flex: 1,
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#0ea5e9",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s"
                }}
              >
                <Calendar size={13} /> Configure Match
              </button>
            )}

            {scoreLeader && !hasWinner && onSetWinner && (
              <button
                type="button"
                onClick={() => onSetWinner(round, index, scoreLeader)}
                style={{
                  flex: 1,
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#059669",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: 6,
                  padding: "5px 8px",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4
                }}
              >
                <Check size={11} /> Win: {scoreLeader.slice(0, 10)}
              </button>
            )}
          </div>
        </div>
      );
    }

    // View Mode (Public or Admin Viewer)
    return (
      <div 
        key={`${round}-${index}`}
        id={`bracket-match-${round}-${index}`}
        onClick={() => setSelectedMatchInfo({ roundName, match, round, index, linkedMatch })}
        style={{ 
          background: isFinal ? "#fff7ed" : "#ffffff", 
          color: "#1f2937", 
          padding: 16, 
          borderRadius: 14, 
          width: isFinal ? 280 : 250, 
          boxShadow: isFinal ? "0 10px 25px -5px rgba(249, 115, 22, 0.25)" : "0 4px 14px rgba(0,0,0,0.06)", 
          border: isFinal ? "2.5px solid #f97316" : (hasWinner ? "1.5px solid #cbd5e1" : "1px solid #e2e8f0"), 
          position: "relative",
          zIndex: 2,
          boxSizing: "border-box",
          cursor: "pointer",
          transition: "transform 0.15s ease, box-shadow 0.15s ease"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = isFinal ? "0 10px 25px -5px rgba(249, 115, 22, 0.25)" : "0 4px 14px rgba(0,0,0,0.06)";
        }}
      >
        {/* Match Header Tag */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: isFinal ? "#ea580c" : "#64748b", letterSpacing: 0.5 }}>
            {roundName}
          </span>
          {isLive ? (
            <span style={{ fontSize: 9, fontWeight: 900, background: "#fee2e2", color: "#dc2626", padding: "1px 5px", borderRadius: 4, display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#dc2626", display: "inline-block" }}></span> LIVE
            </span>
          ) : hasWinner ? (
            <span style={{ fontSize: 9, fontWeight: 900, background: "#dcfce7", color: "#166534", padding: "1px 5px", borderRadius: 4 }}>
              FINAL
            </span>
          ) : match.team1 && match.team2 ? (
            <span style={{ fontSize: 9, fontWeight: 800, background: "#f1f5f9", color: "#64748b", padding: "1px 5px", borderRadius: 4 }}>
              UPCOMING
            </span>
          ) : (
            <span style={{ fontSize: 9, fontWeight: 800, background: "#f1f5f9", color: "#94a3b8", padding: "1px 5px", borderRadius: 4 }}>
              TBD
            </span>
          )}
        </div>

        {/* Team 1 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "4px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, overflow: "hidden" }}>
            {redCorner && <span style={{ fontSize: 8, fontWeight: 900, color: "#ef4444", background: "#fee2e2", padding: "1px 4px", borderRadius: 3 }}>R</span>}
            <span style={{ 
              fontWeight: team1IsWinner ? 900 : (match.team1 ? 700 : 500), 
              fontSize: 14, 
              color: team1IsWinner ? "#059669" : (match.team1 ? "#1e293b" : "#94a3b8"), 
              textOverflow: "ellipsis", 
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              flex: 1 
            }}>
              {match.team1 || "TBD"}
            </span>
            {hasWinner && team1IsWinner && (
              <span style={{ background: "#10b981", color: "#fff", fontSize: 9, fontWeight: 900, padding: "1px 5px", borderRadius: 4, letterSpacing: 0.5, flexShrink: 0, display: "flex", alignItems: "center", gap: 2 }}>
                <Check size={10} /> W
              </span>
            )}
            {hasWinner && !team1IsWinner && match.team1 && (
              <span style={{ background: "#f1f5f9", color: "#94a3b8", fontSize: 9, fontWeight: 800, padding: "1px 4px", borderRadius: 4, letterSpacing: 0.5, flexShrink: 0 }}>
                L
              </span>
            )}
          </div>
          <div style={{ 
            fontSize: 15, 
            fontWeight: 900, 
            color: team1IsWinner ? "#059669" : (match.team1 ? "#334155" : "#cbd5e1"), 
            minWidth: 24, 
            textAlign: "right" 
          }}>
            {match.score1 ?? 0}
          </div>
        </div>

        <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />

        {/* Team 2 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "4px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, overflow: "hidden" }}>
            {blueCorner && <span style={{ fontSize: 8, fontWeight: 900, color: "#2563eb", background: "#dbeafe", padding: "1px 4px", borderRadius: 3 }}>B</span>}
            <span style={{ 
              fontWeight: team2IsWinner ? 900 : (match.team2 ? 700 : 500), 
              fontSize: 14, 
              color: team2IsWinner ? "#059669" : (match.team2 ? "#1e293b" : "#94a3b8"), 
              textOverflow: "ellipsis", 
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              flex: 1 
            }}>
              {match.team2 || "TBD"}
            </span>
            {hasWinner && team2IsWinner && (
              <span style={{ background: "#10b981", color: "#fff", fontSize: 9, fontWeight: 900, padding: "1px 5px", borderRadius: 4, letterSpacing: 0.5, flexShrink: 0, display: "flex", alignItems: "center", gap: 2 }}>
                <Check size={10} /> W
              </span>
            )}
            {hasWinner && !team2IsWinner && match.team2 && (
              <span style={{ background: "#f1f5f9", color: "#94a3b8", fontSize: 9, fontWeight: 800, padding: "1px 4px", borderRadius: 4, letterSpacing: 0.5, flexShrink: 0 }}>
                L
              </span>
            )}
          </div>
          <div style={{ 
            fontSize: 15, 
            fontWeight: 900, 
            color: team2IsWinner ? "#059669" : (match.team2 ? "#334155" : "#cbd5e1"), 
            minWidth: 24, 
            textAlign: "right" 
          }}>
            {match.score2 ?? 0}
          </div>
        </div>
      </div>
    );
  };

  const Connector = ({ height, showRightLine = true }: { height: string, showRightLine?: boolean }) => (
    <div style={{ 
      width: 32, 
      borderRight: "2px solid #cbd5e1", 
      borderTop: "2px solid #cbd5e1", 
      borderBottom: "2px solid #cbd5e1", 
      borderTopRightRadius: 8, 
      borderBottomRightRadius: 8, 
      height, 
      position: "relative",
      boxSizing: "border-box"
    }}>
      {showRightLine && (
        <div style={{ position: "absolute", top: "50%", right: -32, width: 32, borderTop: "2px solid #cbd5e1", boxSizing: "border-box" }}></div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", overflowX: "auto" }}>
      {/* Mobile Round Navigation Tabs */}
      {mob && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, justifyContent: "center" }}>
          {(["qf", "sf", "final"] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileRoundTab(tab)}
              style={{
                background: mobileRoundTab === tab ? "#f97316" : "#ffffff",
                color: mobileRoundTab === tab ? "#ffffff" : "#64748b",
                border: mobileRoundTab === tab ? "none" : "1px solid #e2e8f0",
                padding: "8px 16px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: mobileRoundTab === tab ? "0 4px 10px rgba(249,115,22,0.3)" : "none"
              }}
            >
              {tab === "qf" ? "Quarter Finals (4)" : tab === "sf" ? "Semi Finals (2)" : "Finals & Champion"}
            </button>
          ))}
        </div>
      )}

      {/* Headers Row - Desktop Only */}
      {!mob && (
        <div style={{ display: "flex", minWidth: 964, padding: "0 32px" }}>
          <div style={{ width: 250, textAlign: "center", fontSize: 13, fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: 1.2 }}>Quarter Finals (Round 1)</div>
          <div style={{ width: 64 }}></div>
          <div style={{ width: 250, textAlign: "center", fontSize: 13, fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: 1.2 }}>Semi Finals (Round 2)</div>
          <div style={{ width: 64 }}></div>
          <div style={{ width: 280, textAlign: "center", fontSize: 13, fontWeight: 900, color: "#ea580c", textTransform: "uppercase", letterSpacing: 1.2 }}>Championship Finals</div>
        </div>
      )}

      {/* Main Bracket Tree Container */}
      <div style={{ 
        display: "flex", 
        flexDirection: mob ? "column" : "row", 
        alignItems: "stretch", 
        background: "#f8fafc", 
        padding: mob ? "24px 16px" : "36px 32px", 
        borderRadius: 18, 
        border: "1px solid #e2e8f0",
        minWidth: mob ? "auto" : 964,
        minHeight: mob ? "auto" : 640
      }}>
        {/* QF Column */}
        {(!mob || mobileRoundTab === "qf") && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", flexShrink: 0, width: mob ? "100%" : 250, gap: mob ? 16 : 0, alignItems: mob ? "center" : "stretch" }}>
            {mob && <div style={{ fontSize: 13, fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: 1, textAlign: "center", marginBottom: 12 }}>Quarter Finals (4 Matches)</div>}
            {bracket?.qf?.map((match, i) => renderMatch(match, "qf", i))}
          </div>
        )}

        {/* QF to SF Connector */}
        {!mob && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", width: 64, flexShrink: 0 }}>
             <Connector height="25%" />
             <Connector height="25%" />
          </div>
        )}

        {/* SF Column */}
        {(!mob || mobileRoundTab === "sf") && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", flexShrink: 0, width: mob ? "100%" : 250, gap: mob ? 16 : 0, alignItems: mob ? "center" : "stretch" }}>
            {mob && <div style={{ fontSize: 13, fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: 1, textAlign: "center", marginBottom: 12 }}>Semi Finals (2 Matches)</div>}
            {bracket?.sf?.map((match, i) => renderMatch(match, "sf", i))}
          </div>
        )}

        {/* SF to Final Connector */}
        {!mob && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 64, flexShrink: 0 }}>
             <Connector height="50%" />
          </div>
        )}

        {/* Final Column */}
        {(!mob || mobileRoundTab === "final") && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexShrink: 0, width: mob ? "100%" : 280, position: "relative", alignItems: mob ? "center" : "stretch" }}>
            {mob && <div style={{ fontSize: 13, fontWeight: 900, color: "#ea580c", textTransform: "uppercase", letterSpacing: 1, textAlign: "center", marginBottom: 12 }}>Championship Match</div>}
            
            <div style={{ display: "flex", justifyContent: "center", width: "100%", zIndex: 2 }}>
              {renderMatch(bracket.final, "final", 0)}
            </div>
            
            {/* Champion Celebration Box */}
            <div style={{ 
              position: mob ? "static" : "absolute", 
              top: mob ? "auto" : "calc(50% + 95px)", 
              left: 0,
              marginTop: mob ? 24 : 0, 
              background: bracket.champion ? "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)" : "rgba(249,115,22,0.06)", 
              padding: 20, 
              borderRadius: 14, 
              border: bracket.champion ? "2px solid #f97316" : "1.5px dashed rgba(249,115,22,0.4)", 
              textAlign: "center", 
              width: mob ? "100%" : 280, 
              maxWidth: 280,
              zIndex: 2,
              boxSizing: "border-box",
              boxShadow: bracket.champion ? "0 8px 24px rgba(249,115,22,0.18)" : "none"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10 }}>
                <Trophy size={20} color="#ea580c" />
                <h4 style={{ margin: 0, color: "#ea580c", fontSize: 16, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>
                  Tournament Champion
                </h4>
              </div>

              {isEditing && onChampionUpdate ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <select 
                    id="bracket-champion-select"
                    value={bracket.champion || ""} 
                    onChange={e => onChampionUpdate(e.target.value)} 
                    style={{ 
                      width: "100%", 
                      background: "#fff", 
                      border: "2px solid rgba(249,115,22,0.5)", 
                      color: "#ea580c", 
                      padding: "10px 12px", 
                      borderRadius: 8, 
                      fontWeight: 900, 
                      textAlign: "center", 
                      fontSize: 16, 
                      cursor: "pointer", 
                      outline: "none", 
                      boxSizing: "border-box" 
                    }}
                  >
                    <option value="">-- Select Champion --</option>
                    {bracket.final.team1 && <option value={bracket.final.team1}>{bracket.final.team1}</option>}
                    {bracket.final.team2 && <option value={bracket.final.team2}>{bracket.final.team2}</option>}
                    {availableTeams.filter(t => t !== bracket.final.team1 && t !== bracket.final.team2).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  {bracket.champion && (
                    <button
                      type="button"
                      onClick={() => onChampionUpdate("")}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#94a3b8",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        textDecoration: "underline"
                      }}
                    >
                      Clear Champion
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ 
                  width: "100%", 
                  background: bracket.champion ? "#ffffff" : "rgba(255,255,255,0.7)", 
                  border: bracket.champion ? "2px solid #ea580c" : "1px dashed #cbd5e1", 
                  color: bracket.champion ? "#ea580c" : "#94a3b8", 
                  padding: "12px", 
                  borderRadius: 10, 
                  fontWeight: 900, 
                  textAlign: "center", 
                  fontSize: 18, 
                  boxShadow: bracket.champion ? "0 4px 12px rgba(249,115,22,0.15)" : "none", 
                  boxSizing: "border-box" 
                }}>
                  {bracket.champion || "TBD (Awaiting Final)"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Match Details Inspection Modal */}
      {selectedMatchInfo && (
        <div 
          id="bracket-match-modal"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(3px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
          onClick={() => setSelectedMatchInfo(null)}
        >
          <div 
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 24,
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              color: "#1e293b"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", color: "#ea580c", letterSpacing: 1 }}>
                  {sport} • {selectedMatchInfo.roundName}
                </span>
                <h3 style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 900, color: "#0f172a" }}>Match Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMatchInfo(null)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Matchup Card */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: selectedMatchInfo.match.winner === selectedMatchInfo.match.team1 ? 900 : 700, fontSize: 16, color: selectedMatchInfo.match.winner === selectedMatchInfo.match.team1 ? "#059669" : "#1e293b" }}>
                  {selectedMatchInfo.match.team1 || "TBD"}
                </span>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{selectedMatchInfo.match.score1 ?? 0}</span>
              </div>
              <div style={{ height: 1, background: "#e2e8f0", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: selectedMatchInfo.match.winner === selectedMatchInfo.match.team2 ? 900 : 700, fontSize: 16, color: selectedMatchInfo.match.winner === selectedMatchInfo.match.team2 ? "#059669" : "#1e293b" }}>
                  {selectedMatchInfo.match.team2 || "TBD"}
                </span>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{selectedMatchInfo.match.score2 ?? 0}</span>
              </div>
            </div>

            {/* Winner or Status Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontWeight: 700 }}>Winner / Advanced:</span>
                <span style={{ fontWeight: 900, color: selectedMatchInfo.match.winner ? "#059669" : "#94a3b8" }}>
                  {selectedMatchInfo.match.winner || "Not yet determined"}
                </span>
              </div>

              {selectedMatchInfo.linkedMatch && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontWeight: 700 }}>Game Status:</span>
                    <span style={{ fontWeight: 900, textTransform: "capitalize", color: selectedMatchInfo.linkedMatch.status === "live" ? "#ef4444" : "#0f172a" }}>
                      {selectedMatchInfo.linkedMatch.status}
                    </span>
                  </div>
                  {selectedMatchInfo.linkedMatch.venue && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b", fontWeight: 700 }}>Venue:</span>
                      <span style={{ fontWeight: 700 }}>{selectedMatchInfo.linkedMatch.venue}</span>
                    </div>
                  )}
                  {selectedMatchInfo.linkedMatch.match_date && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b", fontWeight: 700 }}>Date:</span>
                      <span style={{ fontWeight: 700 }}>{selectedMatchInfo.linkedMatch.match_date}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedMatchInfo(null)}
              style={{
                width: "100%",
                background: "#0f172a",
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                padding: "12px",
                fontSize: 14,
                fontWeight: 800,
                marginTop: 20,
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
