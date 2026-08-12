import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db as firestoreDb } from "../lib/firebase";
import { initDB, S_STATS } from "../db";
import { Database, Match, Team, Player, User, PlayerStat, ActivityLog, Bracket, Referee } from "../types";

const STORAGE_KEY = "multisports_db_v7";
const FIRESTORE_DOC_ID = "data/sports_db";

let quotaExceeded = false;

interface DatabaseContextType {
  db: Database;
  loading: boolean;
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
  updateMatchLiveState: (matchId: number, updates: Partial<Match>) => void;
  addSport: (sport: string) => void;
  addReferee: (referee: Omit<Referee, "referee_id">) => void;
  deleteReferee: (refereeId: number) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse local db", e);
    }
    return initDB();
  });
  const [loading, setLoading] = useState(true);

  // Read from Firestore on mount and listen to real-time changes
  useEffect(() => {
    const docRef = doc(firestoreDb, FIRESTORE_DOC_ID);
    
    // Subscribe to changes
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        try {
          const parsed = snapshot.data() as Database;
          if (!parsed.sports) parsed.sports = ["Basketball","Volleyball","Table Tennis","Badminton","Sepak Takraw","Arnis","Taekwondo"];
          if (!parsed.teams) parsed.teams = [];
          if (!parsed.players) parsed.players = [];
          if (!parsed.matches) parsed.matches = [];
          if (!parsed.playerStats) parsed.playerStats = [];
          if (!parsed.users) parsed.users = [];
          if (!parsed.finalsGames) parsed.finalsGames = [];
          if (!parsed.brackets) parsed.brackets = [];
          parsed.brackets = parsed.brackets.map((b: any) => ({
            ...b,
            qf: b.qf || Array(4).fill(null).map(() => ({ team1: "", team2: "", score1: 0, score2: 0, winner: "" })),
            sf: b.sf || Array(2).fill(null).map(() => ({ team1: "", team2: "", score1: 0, score2: 0, winner: "" })),
          }));
          if (!parsed.activityLogs) parsed.activityLogs = [];
          if (!parsed.referees) parsed.referees = [];
          
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              const localDb = JSON.parse(saved) as Database;
              if (localDb.lastUpdated && parsed.lastUpdated && localDb.lastUpdated > parsed.lastUpdated) {
                // Local is newer. Keep it.
                setDb(localDb);
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            console.error("Failed to parse local db inside snapshot", e);
          }
          
          setDb(parsed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch (e) {
          console.error("Failed to parse remote database", e);
        }
      } else {
        // Initialize Firestore with default DB if it doesn't exist
        const initial = initDB();
        if (!quotaExceeded) {
          setDoc(docRef, initial).catch(err => {
            if (err.code === 'resource-exhausted') {
              quotaExceeded = true;
              console.warn("Firebase Database Quota Exceeded on init.");
            } else {
              console.error("Failed to initialize Firestore", err);
            }
          });
        }
        setDb(initial);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Removed localStorage sync effect and added Firestore save wrapper
  const syncTimeoutRef = useRef<any>(null);
  const latestDbRef = useRef<Database | null>(null);

  const setDbAndSync = useCallback((updater: (prev: Database) => Database) => {
    setDb((prev) => {
      let nextDb = updater(prev);
      
      if (nextDb === prev) {
        return prev;
      }
      
      nextDb = { ...nextDb, lastUpdated: Date.now() };
      latestDbRef.current = nextDb;
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDb));
      } catch (e) {
        console.error("Local storage error:", e);
      }
      
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      
      syncTimeoutRef.current = setTimeout(() => {
        if (latestDbRef.current && !quotaExceeded) {
          const docRef = doc(firestoreDb, FIRESTORE_DOC_ID);
          setDoc(docRef, latestDbRef.current, { merge: false }).catch(err => {
            if (err.code === 'resource-exhausted') {
              quotaExceeded = true;
              console.warn("Firebase Database Quota Exceeded. Writes disabled for this session.");
            } else {
              console.error("Firestore sync error:", err);
            }
          });
        }
      }, 2000);
      
      return nextDb;
    });
  }, []);

  // Poll for auto-scheduling live matches
  useEffect(() => {
    const interval = setInterval(() => {
      setDbAndSync(prev => {
        let changed = false;
        const now = new Date();
        const matches = prev.matches.map(m => {
          if (m.status === "upcoming" && m.scheduled_start_time) {
            const scheduledTime = new Date(m.scheduled_start_time);
            if (now >= scheduledTime) {
              changed = true;
              return { ...m, status: "live" as const };
            }
          }
          return m;
        });
        if (changed) return { ...prev, matches };
        return prev;
      });
    }, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const addActivityLog = useCallback((message: string) => {
    setDbAndSync(prev => {
      const newId = prev.activityLogs.length > 0 ? Math.max(...prev.activityLogs.map(l => l.id)) + 1 : 1;
      return {
        ...prev,
        activityLogs: [{ id: newId, message, timestamp: new Date().toISOString() }, ...prev.activityLogs].slice(0, 50) // Keep last 50
      };
    });
  }, []);

  const addSport = useCallback((sport: string) => {
    setDbAndSync(prev => {
      if (prev.sports.includes(sport)) return prev;
      return {
        ...prev,
        sports: [...prev.sports, sport]
      };
    });
    addActivityLog(`New sport added: ${sport}`);
  }, [addActivityLog]);

  const addReferee = useCallback((referee: Omit<Referee, "referee_id">) => {
    setDbAndSync(prev => {
      const newId = prev.referees.length > 0 ? Math.max(...prev.referees.map(r => r.referee_id)) + 1 : 1;
      return {
        ...prev,
        referees: [...prev.referees, { ...referee, referee_id: newId }]
      };
    });
  }, []);

  const deleteReferee = useCallback((refereeId: number) => {
    setDbAndSync(prev => ({
      ...prev,
      referees: prev.referees.filter(r => r.referee_id !== refereeId)
    }));
  }, []);

  const updateMatchScore = useCallback((matchId: number, team1Score: number, team2Score: number) => {
    setDbAndSync(prev => ({
      ...prev,
      matches: prev.matches.map(m => 
        m.match_id === matchId ? { ...m, score_team1: team1Score, score_team2: team2Score } : m
      )
    }));
  }, []);

  const updateMatchDetails = useCallback((matchId: number, venue: string, referee: string, current_period?: string, remaining_time?: string) => {
    setDbAndSync(prev => ({
      ...prev,
      matches: prev.matches.map(m => 
        m.match_id === matchId ? { ...m, venue, referee, current_period, remaining_time } : m
      )
    }));
  }, []);

  const updateMatchStatus = useCallback((matchId: number, status: "completed" | "live" | "upcoming", winner?: string | null) => {
    setDbAndSync(prev => {
      const matchToUpd = prev.matches.find(m => m.match_id === matchId);
      if (!matchToUpd) return prev;

      let updatedWinner = winner !== undefined ? winner : matchToUpd.winner;
      
      if (status === "completed" && (!updatedWinner || updatedWinner === null)) {
        let score1 = matchToUpd.sport !== "Basketball" ? (matchToUpd.t1_rounds || 0) : matchToUpd.score_team1;
        let score2 = matchToUpd.sport !== "Basketball" ? (matchToUpd.t2_rounds || 0) : matchToUpd.score_team2;
        
        if (matchToUpd.sport !== "Basketball" && score1 === 0 && score2 === 0) {
          score1 = matchToUpd.score_team1;
          score2 = matchToUpd.score_team2;
        }

        if (score1 > score2) {
          const t1 = prev.teams.find(t => t.team_id === matchToUpd.team1_id);
          updatedWinner = t1?.team_name || null;
        } else if (score2 > score1) {
          const t2 = prev.teams.find(t => t.team_id === matchToUpd.team2_id);
          updatedWinner = t2?.team_name || null;
        } else {
          updatedWinner = "Draw";
        }
      }
      
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

      if (status === "completed" && updatedWinner) {
        const t1 = prev.teams.find(t => t.team_id === matchToUpd.team1_id)?.team_name;
        const t2 = prev.teams.find(t => t.team_id === matchToUpd.team2_id)?.team_name;
        const sport = matchToUpd.sport;
        const b = nextDb.brackets.find(br => br.sport === sport && br.category === matchToUpd.category);
        
        if (b && t1 && t2) {
          let updatedBrackets = [...nextDb.brackets];
          let updatedBracket = { ...b, qf: [...b.qf], sf: [...b.sf], final: { ...b.final } };
          let bIndex = updatedBrackets.findIndex(br => br.sport === sport && br.category === matchToUpd.category);
          
          let scoreToUse1 = matchToUpd.sport !== "Basketball" ? (matchToUpd.t1_rounds || 0) : matchToUpd.score_team1;
          let scoreToUse2 = matchToUpd.sport !== "Basketball" ? (matchToUpd.t2_rounds || 0) : matchToUpd.score_team2;

          let slotFound = false;

          // Check QF
          for(let i=0; i<4; i++) {
            if ((b.qf[i].team1 === t1 && b.qf[i].team2 === t2) || (b.qf[i].team1 === t2 && b.qf[i].team2 === t1)) {
               let isT1 = b.qf[i].team1 === t1;
               updatedBracket.qf[i] = { ...b.qf[i], score1: isT1 ? scoreToUse1 : scoreToUse2, score2: isT1 ? scoreToUse2 : scoreToUse1, winner: updatedWinner };
               let nextSf = Math.floor(i / 2);
               if (i % 2 === 0) updatedBracket.sf[nextSf] = { ...updatedBracket.sf[nextSf], team1: updatedWinner };
               else updatedBracket.sf[nextSf] = { ...updatedBracket.sf[nextSf], team2: updatedWinner };
               slotFound = true;
               break;
            }
          }

          if (!slotFound) {
            for(let i=0; i<2; i++) {
              if ((b.sf[i].team1 === t1 && b.sf[i].team2 === t2) || (b.sf[i].team1 === t2 && b.sf[i].team2 === t1)) {
                 let isT1 = b.sf[i].team1 === t1;
                 updatedBracket.sf[i] = { ...b.sf[i], score1: isT1 ? scoreToUse1 : scoreToUse2, score2: isT1 ? scoreToUse2 : scoreToUse1, winner: updatedWinner };
                 if (i === 0) updatedBracket.final = { ...updatedBracket.final, team1: updatedWinner };
                 else updatedBracket.final = { ...updatedBracket.final, team2: updatedWinner };
                 slotFound = true;
                 break;
              }
            }
          }

          if (!slotFound) {
            if ((b.final.team1 === t1 && b.final.team2 === t2) || (b.final.team1 === t2 && b.final.team2 === t1)) {
               let isT1 = b.final.team1 === t1;
               updatedBracket.final = { ...b.final, score1: isT1 ? scoreToUse1 : scoreToUse2, score2: isT1 ? scoreToUse2 : scoreToUse1, winner: updatedWinner };
               updatedBracket.champion = updatedWinner;
               slotFound = true;
            }
          }

          if (slotFound) {
             updatedBrackets[bIndex] = updatedBracket;
             nextDb.brackets = updatedBrackets;
          }
        }
      }

      return nextDb;
    });
  }, []);

  const updateMatchLiveState = useCallback((matchId: number, updates: Partial<Match>) => {
    setDbAndSync(prev => ({
      ...prev,
      matches: prev.matches.map(m => 
        m.match_id === matchId ? { ...m, ...updates } : m
      )
    }));
  }, []);

  const deleteMatch = useCallback((matchId: number) => {
    setDbAndSync(prev => ({
      ...prev,
      matches: prev.matches.filter(m => m.match_id !== matchId),
      playerStats: prev.playerStats.filter(s => s.match_id !== matchId)
    }));
  }, []);

  const addTeam = useCallback((team: Omit<Team, "team_id">) => {
    setDbAndSync(prev => {
      const newId = prev.teams.length > 0 ? Math.max(...prev.teams.map(t => t.team_id)) + 1 : 1;
      return {
        ...prev,
        teams: [...prev.teams, { ...team, team_id: newId }]
      };
    });
  }, []);

  const updateTeam = useCallback((teamId: number, team: Partial<Team>) => {
    setDbAndSync(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.team_id === teamId ? { ...t, ...team } : t)
    }));
  }, []);

  const deleteTeam = useCallback((teamId: number) => {
    setDbAndSync(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t.team_id !== teamId),
      players: prev.players.filter(p => p.team_id !== teamId)
    }));
  }, []);

  const addPlayer = useCallback((player: Omit<Player, "player_id">) => {
    setDbAndSync(prev => {
      const newId = prev.players.length > 0 ? Math.max(...prev.players.map(p => p.player_id)) + 1 : 1;
      return {
        ...prev,
        players: [...prev.players, { ...player, player_id: newId }]
      };
    });
  }, []);

  const updatePlayer = useCallback((playerId: number, player: Partial<Player>) => {
    setDbAndSync(prev => ({
      ...prev,
      players: prev.players.map(p => p.player_id === playerId ? { ...p, ...player } : p)
    }));
  }, []);

  const deletePlayer = useCallback((playerId: number) => {
    setDbAndSync(prev => ({
      ...prev,
      players: prev.players.filter(p => p.player_id !== playerId),
      playerStats: prev.playerStats.filter(s => s.player_id !== playerId)
    }));
  }, []);

  const addMatch = useCallback((match: Omit<Match, "match_id">) => {
    setDbAndSync(prev => {
      const newId = prev.matches.length > 0 ? Math.max(...prev.matches.map(m => m.match_id)) + 1 : 1;
      return {
        ...prev,
        matches: [...prev.matches, { ...match, match_id: newId }]
      };
    });
  }, []);

  const updatePlayerStat = useCallback((matchId: number, playerId: number, sport: string, statKey: keyof PlayerStat, increment: number) => {
    setDbAndSync(prev => {
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
    setDbAndSync(prev => {
      const newId = prev.users.length > 0 ? Math.max(...prev.users.map(u => u.user_id)) + 1 : 1;
      return {
        ...prev,
        users: [...prev.users, { ...user, user_id: newId }]
      };
    });
  }, []);

  const deleteUser = useCallback((userId: number) => {
    setDbAndSync(prev => ({
      ...prev,
      users: prev.users.filter(u => u.user_id !== userId)
    }));
  }, []);

  const updateBracket = useCallback((sport: string, bracket: Bracket) => {
    setDbAndSync(prev => {
      const existing = prev.brackets.find(b => b.sport === sport && b.category === bracket.category);
      if (existing) {
        return { ...prev, brackets: prev.brackets.map(b => (b.sport === sport && b.category === bracket.category) ? bracket : b) };
      } else {
        return { ...prev, brackets: [...prev.brackets, bracket] };
      }
    });
  }, []);

  const contextValue = useMemo(() => ({
    db, 
    loading,
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
    updateBracket,
    updateMatchLiveState,
    addSport,
    addReferee,
    deleteReferee
  }), [
    db, 
    loading,
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
    updateBracket,
    updateMatchLiveState,
    addSport,
    addReferee,
    deleteReferee
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
