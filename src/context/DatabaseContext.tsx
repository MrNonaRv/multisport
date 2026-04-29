import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from "react";
import { initDB } from "../db";
import { Database, Match, Team, Player, User, PlayerStat, ActivityLog, Bracket } from "../types";

const STORAGE_KEY = "multisports_db";

interface DatabaseContextType {
  db: Database;
  updateMatchScore: (matchId: number, team1Score: number, team2Score: number) => void;
  updateMatchDetails: (matchId: number, venue: string, referee: string, current_period?: string, remaining_time?: string) => void;
  updateMatchStatus: (matchId: number, status: "completed" | "live" | "upcoming", winner?: string | null) => void;
  deleteMatch: (matchId: number) => void;
  addTeam: (team: Omit<Team, "team_id">) => void;
  updateTeam: (teamId: number, team: Partial<Team>) => void;
  deleteTeam: (teamId: number) => void;
  addPlayer: (player: Omit<Player, "player_id">) => void;
  updatePlayer: (playerId: number, player: Partial<Player>) => void;
  deletePlayer: (playerId: number) => void;
  addMatch: (match: Omit<Match, "match_id">) => void;
  updatePlayerStat: (matchId: number, playerId: number, sport: string, statKey: keyof PlayerStat, increment: number) => void;
  addUser: (user: Omit<User, "user_id">) => void;
  deleteUser: (userId: number) => void;
  addActivityLog: (message: string) => void;
  updateBracket: (sport: string, bracket: Bracket) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved database", e);
      }
    }
    return initDB();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  const addActivityLog = useCallback((message: string) => {
    setDb(prev => {
      const newId = prev.activityLogs.length > 0 ? Math.max(...prev.activityLogs.map(l => l.id)) + 1 : 1;
      return {
        ...prev,
        activityLogs: [{ id: newId, message, timestamp: new Date().toISOString() }, ...prev.activityLogs].slice(0, 50) // Keep last 50
      };
    });
  }, []);

  const updateMatchScore = useCallback((matchId: number, team1Score: number, team2Score: number) => {
    setDb(prev => ({
      ...prev,
      matches: prev.matches.map(m => 
        m.match_id === matchId ? { ...m, score_team1: team1Score, score_team2: team2Score } : m
      )
    }));
  }, []);

  const updateMatchDetails = useCallback((matchId: number, venue: string, referee: string, current_period?: string, remaining_time?: string) => {
    setDb(prev => ({
      ...prev,
      matches: prev.matches.map(m => 
        m.match_id === matchId ? { ...m, venue, referee, current_period, remaining_time } : m
      )
    }));
  }, []);

  const updateMatchStatus = useCallback((matchId: number, status: "completed" | "live" | "upcoming", winner?: string | null) => {
    setDb(prev => ({
      ...prev,
      matches: prev.matches.map(m => 
        m.match_id === matchId ? { ...m, status, winner: winner !== undefined ? winner : m.winner } : m
      )
    }));
  }, []);

  const deleteMatch = useCallback((matchId: number) => {
    setDb(prev => ({
      ...prev,
      matches: prev.matches.filter(m => m.match_id !== matchId),
      playerStats: prev.playerStats.filter(s => s.match_id !== matchId)
    }));
  }, []);

  const addTeam = useCallback((team: Omit<Team, "team_id">) => {
    setDb(prev => {
      const newId = prev.teams.length > 0 ? Math.max(...prev.teams.map(t => t.team_id)) + 1 : 1;
      return {
        ...prev,
        teams: [...prev.teams, { ...team, team_id: newId }]
      };
    });
  }, []);

  const updateTeam = useCallback((teamId: number, team: Partial<Team>) => {
    setDb(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.team_id === teamId ? { ...t, ...team } : t)
    }));
  }, []);

  const deleteTeam = useCallback((teamId: number) => {
    setDb(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t.team_id !== teamId),
      players: prev.players.filter(p => p.team_id !== teamId)
    }));
  }, []);

  const addPlayer = useCallback((player: Omit<Player, "player_id">) => {
    setDb(prev => {
      const newId = prev.players.length > 0 ? Math.max(...prev.players.map(p => p.player_id)) + 1 : 1;
      return {
        ...prev,
        players: [...prev.players, { ...player, player_id: newId }]
      };
    });
  }, []);

  const updatePlayer = useCallback((playerId: number, player: Partial<Player>) => {
    setDb(prev => ({
      ...prev,
      players: prev.players.map(p => p.player_id === playerId ? { ...p, ...player } : p)
    }));
  }, []);

  const deletePlayer = useCallback((playerId: number) => {
    setDb(prev => ({
      ...prev,
      players: prev.players.filter(p => p.player_id !== playerId),
      playerStats: prev.playerStats.filter(s => s.player_id !== playerId)
    }));
  }, []);

  const addMatch = useCallback((match: Omit<Match, "match_id">) => {
    setDb(prev => {
      const newId = prev.matches.length > 0 ? Math.max(...prev.matches.map(m => m.match_id)) + 1 : 1;
      return {
        ...prev,
        matches: [...prev.matches, { ...match, match_id: newId }]
      };
    });
  }, []);

  const updatePlayerStat = useCallback((matchId: number, playerId: number, sport: string, statKey: keyof PlayerStat, increment: number) => {
    setDb(prev => {
      const existingStatIndex = prev.playerStats.findIndex(s => s.match_id === matchId && s.player_id === playerId);
      
      if (existingStatIndex >= 0) {
        const newStats = [...prev.playerStats];
        const currentVal = (newStats[existingStatIndex] as any)[statKey] || 0;
        (newStats[existingStatIndex] as any)[statKey] = Math.max(0, currentVal + increment);
        return { ...prev, playerStats: newStats };
      } else {
        const newId = prev.playerStats.length > 0 ? Math.max(...prev.playerStats.map(s => s.stat_id)) + 1 : 1;
        const newStat: PlayerStat = {
          stat_id: newId,
          match_id: matchId,
          player_id: playerId,
          sport: sport,
          [statKey]: Math.max(0, increment)
        };
        return { ...prev, playerStats: [...prev.playerStats, newStat] };
      }
    });
  }, []);

  const addUser = useCallback((user: Omit<User, "user_id">) => {
    setDb(prev => {
      const newId = prev.users.length > 0 ? Math.max(...prev.users.map(u => u.user_id)) + 1 : 1;
      return {
        ...prev,
        users: [...prev.users, { ...user, user_id: newId }]
      };
    });
  }, []);

  const deleteUser = useCallback((userId: number) => {
    setDb(prev => ({
      ...prev,
      users: prev.users.filter(u => u.user_id !== userId)
    }));
  }, []);

  const updateBracket = useCallback((sport: string, bracket: Bracket) => {
    setDb(prev => {
      const existing = prev.brackets.find(b => b.sport === sport);
      if (existing) {
        return { ...prev, brackets: prev.brackets.map(b => b.sport === sport ? bracket : b) };
      } else {
        return { ...prev, brackets: [...prev.brackets, bracket] };
      }
    });
  }, []);

  const contextValue = useMemo(() => ({
    db, 
    updateMatchScore, 
    updateMatchDetails, 
    updateMatchStatus,
    deleteMatch,
    addTeam, 
    updateTeam,
    deleteTeam,
    addPlayer, 
    updatePlayer,
    deletePlayer,
    addMatch,
    updatePlayerStat,
    addUser,
    deleteUser,
    addActivityLog,
    updateBracket
  }), [
    db, 
    updateMatchScore, 
    updateMatchDetails, 
    updateMatchStatus,
    deleteMatch,
    addTeam, 
    updateTeam,
    deleteTeam,
    addPlayer, 
    updatePlayer,
    deletePlayer,
    addMatch,
    updatePlayerStat,
    addUser,
    deleteUser,
    addActivityLog,
    updateBracket
  ]);

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}
