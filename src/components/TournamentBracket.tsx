import React from 'react';
import { Bracket, BracketMatch } from '../types';

interface TournamentBracketProps {
  bracket: Bracket;
  sport: string;
  isEditing?: boolean;
  onMatchUpdate?: (round: "qf" | "sf" | "final", index: number, field: keyof BracketMatch, value: any) => void;
  onChampionUpdate?: (winner: string) => void;
  mob?: boolean;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ 
  bracket, 
  sport, 
  isEditing = false, 
  onMatchUpdate,
  onChampionUpdate,
  mob = false
}) => {

  const renderMatch = (match: BracketMatch, round: "qf" | "sf" | "final", index: number) => {
    const isFinal = round === "final";
    const hasWinner = !!match.winner;
    const team1IsWinner = hasWinner && match.winner === match.team1;
    const team2IsWinner = hasWinner && match.winner === match.team2;
    const redCorner = (sport === "Arnis" || sport === "Taekwondo") ? "RED" : "";
    const blueCorner = (sport === "Arnis" || sport === "Taekwondo") ? "BLUE" : "";

    if (isEditing && onMatchUpdate) {
      return (
        <div style={{
          background: isFinal ? "#f97316" : "#ffffff",
          padding: isFinal ? 20 : 16,
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          border: isFinal ? "3px solid #1f2937" : "1px solid #e2e8f0",
          boxShadow: isFinal ? "4px 4px 0px rgba(0,0,0,0.2)" : "0 4px 16px rgba(0,0,0,0.05)",
          color: isFinal ? "#1f2937" : "#1f2937",
          position: "relative",
          width: isFinal ? 280 : 250,
          zIndex: 2,
          boxSizing: "border-box"
        }}>
          {/* Team 1 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {redCorner && <span style={{ fontSize: 9, fontWeight: 900, color: isFinal ? "#fff" : "#ef4444" }}>{redCorner}</span>}
              <input 
                value={match.team1} 
                onChange={e => onMatchUpdate(round, index, "team1", e.target.value)}
                placeholder="Team 1"
                style={{ width: "100%", background: "transparent", border: "none", borderBottom: `2px dashed ${isFinal ? "rgba(255,255,255,0.4)" : "#cbd5e1"}`, fontWeight: 900, fontSize: 16, color: "inherit", outline: "none", padding: "4px 0", boxSizing: "border-box" }}
              />
            </div>
          </div>
          
          <div style={{ textAlign: "center", fontSize: 12, fontWeight: 900, opacity: 0.6, margin: "-4px 0" }}>VS</div>

          {/* Team 2 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {blueCorner && <span style={{ fontSize: 9, fontWeight: 900, color: isFinal ? "#1f2937" : "#3b82f6" }}>{blueCorner}</span>}
              <input 
                value={match.team2} 
                onChange={e => onMatchUpdate(round, index, "team2", e.target.value)}
                placeholder="Team 2"
                style={{ width: "100%", background: "transparent", border: "none", borderBottom: `2px dashed ${isFinal ? "rgba(255,255,255,0.4)" : "#cbd5e1"}`, fontWeight: 900, fontSize: 16, color: "inherit", outline: "none", padding: "4px 0", boxSizing: "border-box" }}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ 
        background: isFinal ? "#f97316" : "#ffffff", 
        color: isFinal ? "#1f2937" : "#1f2937", 
        padding: isFinal ? 20 : 16, 
        borderRadius: 12, 
        width: isFinal ? 280 : 250, 
        boxShadow: isFinal ? "4px 4px 0px rgba(0,0,0,0.2)" : "0 4px 16px rgba(0,0,0,0.05)", 
        border: isFinal ? "3px solid #1f2937" : "1px solid #e2e8f0", 
        position: "relative",
        zIndex: 2,
        boxSizing: "border-box"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, overflow: "hidden" }}>
            {redCorner && <span style={{ fontSize: 9, fontWeight: 900, color: isFinal ? "#fff" : "#ef4444" }}>{redCorner}</span>}
            <span style={{ fontWeight: 900, fontSize: 16, color: team1IsWinner ? (isFinal ? "#fff" : "#10b981") : "inherit", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", flex: 1 }}>{match.team1 || "TBD"}</span>
            {hasWinner && team1IsWinner && <span style={{ background: isFinal ? "#1f2937" : "#10b981", color: isFinal ? "#f97316" : "#fff", fontSize: 9, fontWeight: 900, padding: "2px 4px", borderRadius: 4, letterSpacing: 0.5, flexShrink: 0 }}>W</span>}
            {hasWinner && !team1IsWinner && match.team1 && <span style={{ background: isFinal ? "rgba(0,0,0,0.2)" : "#ef4444", color: "#fff", fontSize: 9, fontWeight: 900, padding: "2px 4px", borderRadius: 4, letterSpacing: 0.5, flexShrink: 0 }}>L</span>}
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "inherit", minWidth: 24, textAlign: "right" }}>{match.score1 || 0}</div>
        </div>
        <div style={{ height: 1, background: isFinal ? "rgba(0,0,0,0.1)" : "#e2e8f0", margin: "-4px 0 8px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, overflow: "hidden" }}>
            {blueCorner && <span style={{ fontSize: 9, fontWeight: 900, color: isFinal ? "#1f2937" : "#3b82f6" }}>{blueCorner}</span>}
            <span style={{ fontWeight: 900, fontSize: 16, color: team2IsWinner ? (isFinal ? "#fff" : "#10b981") : "inherit", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", flex: 1 }}>{match.team2 || "TBD"}</span>
            {hasWinner && team2IsWinner && <span style={{ background: isFinal ? "#1f2937" : "#10b981", color: isFinal ? "#f97316" : "#fff", fontSize: 9, fontWeight: 900, padding: "2px 4px", borderRadius: 4, letterSpacing: 0.5, flexShrink: 0 }}>W</span>}
            {hasWinner && !team2IsWinner && match.team2 && <span style={{ background: isFinal ? "rgba(0,0,0,0.2)" : "#ef4444", color: "#fff", fontSize: 9, fontWeight: 900, padding: "2px 4px", borderRadius: 4, letterSpacing: 0.5, flexShrink: 0 }}>L</span>}
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "inherit", minWidth: 24, textAlign: "right" }}>{match.score2 || 0}</div>
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
      boxSizing: "border-box",
      margin: mob ? "16px auto" : "0" // Just for mob fallback
    }}>
      {showRightLine && (
        <div style={{ position: "absolute", top: "50%", right: -32, width: 32, borderTop: "2px solid #cbd5e1", boxSizing: "border-box" }}></div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", overflowX: "auto" }}>
      {/* Headers Row - Only show on desktop */}
      {!mob && (
        <div style={{ display: "flex", minWidth: 924, padding: "0 32px" }}>
          <div style={{ width: 250, textAlign: "center", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Quarter Finals</div>
          <div style={{ width: 64 }}></div>
          <div style={{ width: 250, textAlign: "center", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Semi Finals</div>
          <div style={{ width: 64 }}></div>
          <div style={{ width: 280, textAlign: "center", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Finals</div>
        </div>
      )}

      {/* Bracket Body */}
      <div style={{ 
        display: "flex", 
        flexDirection: mob ? "column" : "row", 
        alignItems: "stretch", 
        background: "#f8fafc", 
        padding: mob ? "32px 16px" : "32px", 
        borderRadius: 16, 
        minWidth: mob ? "auto" : 964, // 250 + 64 + 250 + 64 + 280 + 32 + 32
        minHeight: mob ? "auto" : 640
      }}>
        {/* QF Column */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", flexShrink: 0, width: 250, gap: mob ? 16 : 0 }}>
          {mob && <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, textAlign: "center", marginBottom: 16 }}>Quarter Finals</div>}
          {bracket?.qf?.map((match, i) => React.cloneElement(renderMatch(match, "qf", i), { key: i }))}
        </div>

        {/* QF to SF Connector */}
        {!mob && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", width: 64, flexShrink: 0 }}>
             <Connector height="25%" />
             <Connector height="25%" />
          </div>
        )}

        {/* SF Column */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", flexShrink: 0, width: 250, gap: mob ? 16 : 0 }}>
          {mob && <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, textAlign: "center", marginBottom: 16, marginTop: 48 }}>Semi Finals</div>}
          {bracket?.sf?.map((match, i) => React.cloneElement(renderMatch(match, "sf", i), { key: i }))}
        </div>

        {/* SF to Final Connector */}
        {!mob && (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 64, flexShrink: 0 }}>
             <Connector height="50%" />
          </div>
        )}

        {/* Final Column */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexShrink: 0, width: 280, position: "relative" }}>
          {mob && <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, textAlign: "center", marginBottom: 16, marginTop: 48 }}>Finals</div>}
          
          <div style={{ display: "flex", justifyContent: "center", width: "100%", zIndex: 2 }}>
            {renderMatch(bracket.final, "final", 0)}
          </div>
          
          {/* Champion Selector/Display */}
          <div style={{ 
            position: mob ? "static" : "absolute", 
            top: mob ? "auto" : "calc(50% + 80px)", 
            left: 0,
            marginTop: mob ? 32 : 0, 
            background: "rgba(249,115,22,0.1)", 
            padding: 24, 
            borderRadius: 12, 
            border: "2px solid rgba(249,115,22,0.3)", 
            textAlign: "center", 
            width: 280, 
            zIndex: 2,
            boxSizing: "border-box"
          }}>
            <h4 style={{ margin: "0 0 16px", color: "#ea580c", fontSize: 20, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>🏆 Champion</h4>
            {isEditing && onChampionUpdate ? (
              <select 
                value={bracket.champion || ""} 
                onChange={e => onChampionUpdate(e.target.value)} 
                style={{ width: "100%", background: "#fff", border: "2px solid rgba(249,115,22,0.5)", color: "#ea580c", padding: "12px", borderRadius: 8, fontWeight: 900, textAlign: "center", fontSize: 20, cursor: "pointer", outline: "none", appearance: "none", boxShadow: "0 4px 12px rgba(249,115,22,0.1)", boxSizing: "border-box" }}
              >
                <option value="">Select Champion</option>
                {bracket.final.team1 && <option value={bracket.final.team1}>{bracket.final.team1}</option>}
                {bracket.final.team2 && <option value={bracket.final.team2}>{bracket.final.team2}</option>}
              </select>
            ) : (
              <div style={{ width: "100%", background: "#fff", border: "2px solid rgba(249,115,22,0.5)", color: "#ea580c", padding: "12px", borderRadius: 8, fontWeight: 900, textAlign: "center", fontSize: 20, boxShadow: "0 4px 12px rgba(249,115,22,0.1)", boxSizing: "border-box" }}>
                {bracket.champion || "TBD"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
