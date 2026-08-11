const fs = require('fs');
let code = fs.readFileSync('src/context/DatabaseContext.tsx', 'utf8');

// Add import for S_STATS
code = code.replace(/import { initDB } from "\.\.\/db";/, 'import { initDB, S_STATS } from "../db";');

// In updateMatchStatus
const updateMatchStatusStart = code.indexOf('const updateMatchStatus = useCallback((matchId: number, status: "completed" | "live" | "upcoming", winner?: string | null) => {');

const replacementStr = `const updateMatchStatus = useCallback((matchId: number, status: "completed" | "live" | "upcoming", winner?: string | null) => {
    setDbAndSync(prev => {
      const matchToUpd = prev.matches.find(m => m.match_id === matchId);
      if (!matchToUpd) return prev;

      const updatedWinner = winner !== undefined ? winner : matchToUpd.winner;
      
      let nextDb = {
        ...prev
      };
      
      // Calculate MVP if completed
      let mvp_id = matchToUpd.mvp_id;
      if (status === "completed") {
        const sportStatsKeys = (S_STATS as any)[matchToUpd.sport] || ["points"];
        const primaryStat = sportStatsKeys[0];
        
        const matchStats = prev.playerStats.filter(s => s.match_id === matchId);
        if (matchStats.length > 0) {
          const topStat = [...matchStats].sort((a, b) => ((b as any)[primaryStat] || 0) - ((a as any)[primaryStat] || 0))[0];
          mvp_id = topStat.player_id;
        }
      }

      nextDb.matches = prev.matches.map(m => 
        m.match_id === matchId ? { ...m, status, winner: updatedWinner, mvp_id } : m
      );

      if (status === "completed" && updatedWinner) {`;

code = code.replace(`const updateMatchStatus = useCallback((matchId: number, status: "completed" | "live" | "upcoming", winner?: string | null) => {
    setDbAndSync(prev => {
      const matchToUpd = prev.matches.find(m => m.match_id === matchId);
      if (!matchToUpd) return prev;

      const updatedWinner = winner !== undefined ? winner : matchToUpd.winner;
      
      let nextDb = {
        ...prev,
        matches: prev.matches.map(m => 
          m.match_id === matchId ? { ...m, status, winner: updatedWinner } : m
        )
      };

      if (status === "completed" && updatedWinner) {`, replacementStr);

fs.writeFileSync('src/context/DatabaseContext.tsx', code);
