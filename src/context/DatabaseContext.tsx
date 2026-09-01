import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db as firestoreDb, auth, testConnection } from "../lib/firebase";
import { initDB, S_STATS } from "../db";
import { Database, Match, Team, Player, User, PlayerStat, ActivityLog, Bracket, Referee } from "../types";

const STORAGE_KEY = "multisports_db_v7";
const FIRESTORE_DOC_ID = "data/sports_db";

let quotaExceeded = typeof window !== "undefined" && window.sessionStorage?.getItem("firestore_quota_exceeded") === "true";
let globalSetQuotaExceeded: ((val: boolean) => void) | null = null;

interface LiveGameActionParams {
  matchId: number;
  playerId?: number;
  sport?: string;
  statKey?: keyof PlayerStat;
  statIncrement?: number;
  ptsIncrement?: number;
  scoreTeam1?: number;
  scoreTeam2?: number;
  t1Rounds?: number;
  t2Rounds?: number;
  clockStatus?: "running" | "paused";
  remainingTime?: string;
  remainingSeconds?: number;
  lastClockUpdate?: number;
  matchStatus?: "completed" | "live" | "upcoming";
  winner?: string | null;
  timeoutsTeam1?: number;
  timeoutsTeam2?: number;
  currentPeriod?: string;
  activePlayerIds?: number[];
  recentAction?: {
    player_name: string;
    action: string;
    team_id: number;
    timestamp: string;
  } | null;
  activityLogMessage?: string;
}

interface DatabaseContextType {
  db: Database;
  loading: boolean;
  isQuotaExceeded?: boolean;
  adminNotifications: { id: string; message: string; type: "success" | "info" | "warning"; timestamp: number }[];
  addAdminNotification: (message: string, type?: "success" | "info" | "warning") => void;
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
  recordLiveGameAction: (params: LiveGameActionParams) => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (importedDb: Database) => Promise<boolean>;
  forceSyncToCloud: () => Promise<boolean>;
  transferToNewFirebase: (newConfig: any) => Promise<{ success: boolean; error?: string }>;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const isQuota = errorMsg.toLowerCase().includes("quota") || errorMsg.toLowerCase().includes("resource-exhausted") || errorMsg.toLowerCase().includes("unavailable");
  
  if (isQuota) {
    quotaExceeded = true;
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.setItem("firestore_quota_exceeded", "true");
      }
    } catch {}
    if (globalSetQuotaExceeded) {
      globalSetQuotaExceeded(true);
    }
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (isQuota) {
    console.warn("Firestore operating in local/offline storage mode due to quota limits:", errInfo);
    return;
  }

  console.error("Firestore Error: ", JSON.stringify(errInfo));
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const clientId = useRef<string>(Math.random().toString(36).substring(2) + Date.now().toString(36));
  const channelRef = useRef<BroadcastChannel | null>(null);

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
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<{ id: string; message: string; type: "success" | "info" | "warning"; timestamp: number }[]>([]);

  const addAdminNotification = useCallback((message: string, type: "success" | "info" | "warning" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setAdminNotifications(prev => [
      { id, message, type, timestamp: Date.now() },
      ...prev
    ]);
    setTimeout(() => {
      setAdminNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    globalSetQuotaExceeded = setIsQuotaExceeded;
    if (quotaExceeded) {
      setIsQuotaExceeded(true);
    }
    return () => {
      globalSetQuotaExceeded = null;
    };
  }, []);

  const isWritingRef = useRef<boolean>(false);
  const pendingWriteRef = useRef<boolean>(false);
  const syncTimerRef = useRef<any>(null);
  const lastWriteTimeRef = useRef<number>(0);
  const latestDbRef = useRef<Database>(db);

  // Keep latestDbRef in sync with state
  latestDbRef.current = db;

  // Real-time Cross-tab broadcast & storage listener
  useEffect(() => {
    if (typeof BroadcastChannel !== "undefined") {
      try {
        const channel = new BroadcastChannel("multisports_sync_v7");
        channelRef.current = channel;
        channel.onmessage = (event) => {
          if (event.data && event.data.type === "SYNC_DB" && event.data.payload) {
            if (event.data.senderId !== clientId.current) {
              const incoming = event.data.payload as Database;
              const currentLastUpdated = latestDbRef.current?.lastUpdated || 0;
              const incomingLastUpdated = incoming.lastUpdated || 0;
              if (incomingLastUpdated >= currentLastUpdated) {
                setDb(incoming);
                latestDbRef.current = incoming;
              }
            }
          }
        };
      } catch (e) {
        console.warn("BroadcastChannel error:", e);
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Database;
          const currentLastUpdated = latestDbRef.current?.lastUpdated || 0;
          const incomingLastUpdated = parsed.lastUpdated || 0;
          if (incomingLastUpdated >= currentLastUpdated) {
            setDb(parsed);
            latestDbRef.current = parsed;
          }
        } catch (err) {
          console.error("Storage sync error:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Flush to Firestore worker
  const flushToFirestore = useCallback(() => {
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    if (quotaExceeded) return;
    if (!latestDbRef.current) return;

    if (isWritingRef.current) {
      pendingWriteRef.current = true;
      return;
    }

    isWritingRef.current = true;
    lastWriteTimeRef.current = Date.now();
    const docRef = doc(firestoreDb, FIRESTORE_DOC_ID);
    const dataToSave = latestDbRef.current;

    setDoc(docRef, dataToSave, { merge: false })
      .catch((err) => {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const isQuota = errorMsg.toLowerCase().includes("quota") || errorMsg.toLowerCase().includes("resource-exhausted") || errorMsg.toLowerCase().includes("unavailable");
        if (isQuota) {
          quotaExceeded = true;
          pendingWriteRef.current = false;
          if (globalSetQuotaExceeded) {
            globalSetQuotaExceeded(true);
          }
        }
        try {
          handleFirestoreError(err, OperationType.WRITE, FIRESTORE_DOC_ID);
        } catch (e) {
          console.warn("Firestore write sync error (operating in offline/local sync mode):", e);
        }
      })
      .finally(() => {
        isWritingRef.current = false;
        if (pendingWriteRef.current && !quotaExceeded) {
          pendingWriteRef.current = false;
          // Wait to respect the throttle limit before writing again
          syncTimerRef.current = setTimeout(flushToFirestore, Math.max(0, 800 - (Date.now() - lastWriteTimeRef.current)));
        }
      });
  }, []);

  const scheduleFirestoreSync = useCallback((immediate: boolean = false) => {
    if (quotaExceeded) return;
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    const now = Date.now();
    const timeSinceLastWrite = now - lastWriteTimeRef.current;
    const THROTTLE_MS = 800; // Keep under Firestore's 1 write/sec limit

    if (immediate && timeSinceLastWrite >= THROTTLE_MS && !isWritingRef.current) {
      flushToFirestore();
    } else {
      // Throttle rapid updates to prevent Firestore listeners from stalling
      const delay = immediate ? Math.max(30, THROTTLE_MS - timeSinceLastWrite) : 1500;
      syncTimerRef.current = setTimeout(flushToFirestore, delay);
    }
  }, [flushToFirestore]);

  // Read from Firestore on mount and listen to real-time changes
  useEffect(() => {
    testConnection().catch(() => {});
    const docRef = doc(firestoreDb, FIRESTORE_DOC_ID);
    
    // Subscribe to changes
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        try {
          const parsed = snapshot.data() as Database;
          
          // Safety guard: do not let stale server snapshots overwrite fresher local or broadcasted state
          const currentLastUpdated = latestDbRef.current?.lastUpdated || 0;
          const incomingLastUpdated = parsed.lastUpdated || 0;
          if (incomingLastUpdated < currentLastUpdated) {
            console.log("Ignoring stale incoming server snapshot", { incomingLastUpdated, currentLastUpdated });
            setLoading(false);
            return;
          }

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

          setDb(parsed);
          latestDbRef.current = parsed;
          setLoading(false);
        } catch (e) {
          console.error("Failed to parse Firestore data", e);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }, (error) => {
      setLoading(false);
      try {
        handleFirestoreError(error, OperationType.GET, FIRESTORE_DOC_ID);
      } catch (err) {
        console.warn("Firestore onSnapshot error (operating in offline/local sync mode):", err);
      }
    });

    return () => unsubscribe();
  }, []);

  const setDbAndSync = useCallback((updater: (prev: Database) => Database, immediateSync: boolean = false) => {
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
      
      if (channelRef.current) {
        try {
          channelRef.current.postMessage({
            type: "SYNC_DB",
            payload: nextDb,
            senderId: clientId.current
          });
        } catch (e) {
          console.error("Channel post error:", e);
        }
      }
      
      scheduleFirestoreSync(immediateSync);
      
      return nextDb;
    });
  }, [scheduleFirestoreSync]);

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
    const numId = Number(refereeId);
    let refName = "";
    setDbAndSync(prev => {
      const r = prev.referees.find(item => Number(item.referee_id) === numId);
      if (r) refName = r.name;
      return {
        ...prev,
        referees: prev.referees.filter(r => Number(r.referee_id) !== numId)
      };
    }, true);
    addAdminNotification(`🗑️ Deleted referee: ${refName || `Referee #${numId}`}`, "info");
  }, [addAdminNotification, setDbAndSync]);

  const updateMatchScore = useCallback((matchId: number, team1Score: number, team2Score: number) => {
    setDbAndSync(prev => ({
      ...prev,
      matches: prev.matches.map(m => 
        m.match_id === matchId ? { ...m, score_team1: team1Score, score_team2: team2Score } : m
      )
    }));

    setTimeout(() => {
      const match = latestDbRef.current?.matches.find(m => m.match_id === matchId);
      if (match) {
        const t1 = latestDbRef.current?.teams.find(t => t.team_id === match.team1_id);
        const t2 = latestDbRef.current?.teams.find(t => t.team_id === match.team2_id);
        const scoreDisplay = match.sport !== "Basketball" 
          ? `Sets: ${match.t1_rounds || 0}-${match.t2_rounds || 0} (Pts: ${team1Score}-${team2Score})`
          : `${team1Score} - ${team2Score}`;
        addAdminNotification(
          `🎯 Score Updated: ${match.sport} • ${t1?.team_name || "Team 1"} vs ${t2?.team_name || "Team 2"} is now ${scoreDisplay}`,
          "success"
        );
      }
    }, 50);
  }, [addAdminNotification]);

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
    const numId = Number(matchId);
    let deletedInfo = "";

    setDbAndSync(prev => {
      const matchToDelete = prev.matches.find(m => Number(m.match_id) === numId);
      if (matchToDelete) {
        const t1 = prev.teams.find(t => Number(t.team_id) === Number(matchToDelete.team1_id));
        const t2 = prev.teams.find(t => Number(t.team_id) === Number(matchToDelete.team2_id));
        deletedInfo = `${matchToDelete.sport}: ${t1?.team_name || 'Team 1'} vs ${t2?.team_name || 'Team 2'}`;
      }
      return {
        ...prev,
        matches: prev.matches.filter(m => Number(m.match_id) !== numId),
        playerStats: prev.playerStats.filter(s => Number(s.match_id) !== numId)
      };
    }, true);

    addAdminNotification(`🗑️ Deleted match: ${deletedInfo || `Match #${numId}`}`, "info");
    if (deletedInfo) {
      addActivityLog(`Deleted match: ${deletedInfo}`);
    }
  }, [addAdminNotification, addActivityLog, setDbAndSync]);

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
      teams: prev.teams.map(t => Number(t.team_id) === Number(teamId) ? { ...t, ...team } : t)
    }));
  }, []);

  const deleteTeam = useCallback((teamId: number) => {
    const numId = Number(teamId);
    let teamName = "";
    setDbAndSync(prev => {
      const t = prev.teams.find(item => Number(item.team_id) === numId);
      if (t) teamName = t.team_name;
      return {
        ...prev,
        teams: prev.teams.filter(t => Number(t.team_id) !== numId),
        players: prev.players.filter(p => Number(p.team_id) !== numId),
        matches: prev.matches.filter(m => Number(m.team1_id) !== numId && Number(m.team2_id) !== numId)
      };
    }, true);
    addAdminNotification(`🗑️ Deleted team: ${teamName || `Team #${numId}`}`, "info");
  }, [addAdminNotification, setDbAndSync]);

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
      players: prev.players.map(p => Number(p.player_id) === Number(playerId) ? { ...p, ...player } : p)
    }));
  }, []);

  const deletePlayer = useCallback((playerId: number) => {
    const numId = Number(playerId);
    let playerName = "";
    setDbAndSync(prev => {
      const p = prev.players.find(item => Number(item.player_id) === numId);
      if (p) playerName = p.player_name;
      return {
        ...prev,
        players: prev.players.filter(p => Number(p.player_id) !== numId),
        playerStats: prev.playerStats.filter(s => Number(s.player_id) !== numId)
      };
    }, true);
    addAdminNotification(`🗑️ Deleted player: ${playerName || `Player #${numId}`}`, "info");
  }, [addAdminNotification, setDbAndSync]);

  const addMatch = useCallback((match: Omit<Match, "match_id">) => {
    setDbAndSync(prev => {
      const newId = prev.matches.length > 0 ? Math.max(...prev.matches.map(m => m.match_id)) + 1 : 1;
      return {
        ...prev,
        matches: [...prev.matches, { ...match, match_id: newId, status: match.status || "upcoming" }]
      };
    }, true);
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
    }, true);
  }, []);

  const deleteUser = useCallback((userId: number) => {
    const numId = Number(userId);
    let userName = "";
    setDbAndSync(prev => {
      const u = prev.users.find(item => Number(item.user_id) === numId);
      if (u) userName = u.name;
      return {
        ...prev,
        users: prev.users.filter(u => Number(u.user_id) !== numId)
      };
    }, true);
    addAdminNotification(`🗑️ Deleted user: ${userName || `User #${numId}`}`, "info");
  }, [addAdminNotification, setDbAndSync]);

  const updateBracket = useCallback((sport: string, bracket: Bracket) => {
    setDbAndSync(prev => {
      const existing = prev.brackets.find(b => b.sport === sport && b.category === bracket.category);
      if (existing) {
        return { ...prev, brackets: prev.brackets.map(b => (b.sport === sport && b.category === bracket.category) ? bracket : b) };
      } else {
        return { ...prev, brackets: [...prev.brackets, bracket] };
      }
    });
  }, [setDbAndSync]);

  const recordLiveGameAction = useCallback((params: LiveGameActionParams) => {
    setDbAndSync(prev => {
      let nextDb = { ...prev };
      
      // 1. Update player stat if specified
      if (params.playerId && params.statKey && params.statIncrement !== undefined && params.statIncrement !== 0) {
        const existingStatIndex = nextDb.playerStats.findIndex(s => s.match_id === params.matchId && s.player_id === params.playerId);
        if (existingStatIndex >= 0) {
          const newStats = [...nextDb.playerStats];
          const currentVal = (newStats[existingStatIndex] as any)[params.statKey] || 0;
          (newStats[existingStatIndex] as any)[params.statKey] = Math.max(0, currentVal + params.statIncrement);
          if (params.ptsIncrement && params.statKey !== "points") {
            const currentPts = newStats[existingStatIndex].points || 0;
            newStats[existingStatIndex].points = Math.max(0, currentPts + params.ptsIncrement);
          }
          nextDb.playerStats = newStats;
        } else {
          const newId = nextDb.playerStats.length > 0 ? Math.max(...nextDb.playerStats.map(s => s.stat_id)) + 1 : 1;
          const newStat: PlayerStat = {
            stat_id: newId,
            match_id: params.matchId,
            player_id: params.playerId,
            sport: params.sport || "",
            [params.statKey]: Math.max(0, params.statIncrement)
          };
          if (params.ptsIncrement && params.statKey !== "points") {
            newStat.points = Math.max(0, params.ptsIncrement);
          }
          nextDb.playerStats = [...nextDb.playerStats, newStat];
        }
      }

      // 2. Update match fields
      const matchIndex = nextDb.matches.findIndex(m => m.match_id === params.matchId);
      if (matchIndex >= 0) {
        const currentM = nextDb.matches[matchIndex];
        const updatedM: Match = { ...currentM };

        if (params.scoreTeam1 !== undefined) updatedM.score_team1 = params.scoreTeam1;
        if (params.scoreTeam2 !== undefined) updatedM.score_team2 = params.scoreTeam2;
        if (params.t1Rounds !== undefined) updatedM.t1_rounds = params.t1Rounds;
        if (params.t2Rounds !== undefined) updatedM.t2_rounds = params.t2Rounds;
        if (params.clockStatus !== undefined) updatedM.clock_status = params.clockStatus;
        if (params.remainingTime !== undefined) updatedM.remaining_time = params.remainingTime;
        if (params.remainingSeconds !== undefined) updatedM.remaining_seconds = params.remainingSeconds;
        if (params.lastClockUpdate !== undefined) updatedM.last_clock_update = params.lastClockUpdate;
        if (params.timeoutsTeam1 !== undefined) updatedM.timeouts_team1 = params.timeoutsTeam1;
        if (params.timeoutsTeam2 !== undefined) updatedM.timeouts_team2 = params.timeoutsTeam2;
        if (params.currentPeriod !== undefined) updatedM.current_period = params.currentPeriod;
        if (params.activePlayerIds !== undefined) updatedM.active_player_ids = params.activePlayerIds;
        if (params.recentAction !== undefined) updatedM.recent_action = params.recentAction || undefined;

        if (params.matchStatus !== undefined) {
          updatedM.status = params.matchStatus;
          if (params.winner !== undefined) {
            updatedM.winner = params.winner;
          }
        }

        // Calculate MVP if completed
        if (updatedM.status === "completed") {
          const sportStatsKeys = (S_STATS as any)[updatedM.sport] || ["points"];
          const primaryStat = sportStatsKeys[0];
          const matchStats = nextDb.playerStats.filter(s => s.match_id === params.matchId);
          if (matchStats.length > 0) {
            const topStat = [...matchStats].sort((a, b) => ((b as any)[primaryStat] || 0) - ((a as any)[primaryStat] || 0))[0];
            updatedM.mvp_id = topStat.player_id;
          }
        }

        const newMatches = [...nextDb.matches];
        newMatches[matchIndex] = updatedM;
        nextDb.matches = newMatches;

        // Auto update bracket if match completed with winner
        if (updatedM.status === "completed" && updatedM.winner) {
          const t1 = nextDb.teams.find(t => t.team_id === updatedM.team1_id)?.team_name;
          const t2 = nextDb.teams.find(t => t.team_id === updatedM.team2_id)?.team_name;
          const sport = updatedM.sport;
          const b = nextDb.brackets.find(br => br.sport === sport && br.category === updatedM.category);
          
          if (b && t1 && t2) {
            let updatedBrackets = [...nextDb.brackets];
            let updatedBracket = { ...b, qf: [...b.qf], sf: [...b.sf], final: { ...b.final } };
            let bIndex = updatedBrackets.findIndex(br => br.sport === sport && br.category === updatedM.category);
            
            let scoreToUse1 = updatedM.sport !== "Basketball" ? (updatedM.t1_rounds || 0) : updatedM.score_team1;
            let scoreToUse2 = updatedM.sport !== "Basketball" ? (updatedM.t2_rounds || 0) : updatedM.score_team2;
            let slotFound = false;

            for (let i = 0; i < 4; i++) {
              if ((b.qf[i].team1 === t1 && b.qf[i].team2 === t2) || (b.qf[i].team1 === t2 && b.qf[i].team2 === t1)) {
                let isT1 = b.qf[i].team1 === t1;
                updatedBracket.qf[i] = { ...b.qf[i], score1: isT1 ? scoreToUse1 : scoreToUse2, score2: isT1 ? scoreToUse2 : scoreToUse1, winner: updatedM.winner };
                let nextSf = Math.floor(i / 2);
                if (i % 2 === 0) updatedBracket.sf[nextSf] = { ...updatedBracket.sf[nextSf], team1: updatedM.winner };
                else updatedBracket.sf[nextSf] = { ...updatedBracket.sf[nextSf], team2: updatedM.winner };
                slotFound = true;
                break;
              }
            }

            if (!slotFound) {
              for (let i = 0; i < 2; i++) {
                if ((b.sf[i].team1 === t1 && b.sf[i].team2 === t2) || (b.sf[i].team1 === t2 && b.sf[i].team2 === t1)) {
                  let isT1 = b.sf[i].team1 === t1;
                  updatedBracket.sf[i] = { ...b.sf[i], score1: isT1 ? scoreToUse1 : scoreToUse2, score2: isT1 ? scoreToUse2 : scoreToUse1, winner: updatedM.winner };
                  if (i === 0) updatedBracket.final = { ...updatedBracket.final, team1: updatedM.winner };
                  else updatedBracket.final = { ...updatedBracket.final, team2: updatedM.winner };
                  slotFound = true;
                  break;
                }
              }
            }

            if (!slotFound) {
              if ((b.final.team1 === t1 && b.final.team2 === t2) || (b.final.team1 === t2 && b.final.team2 === t1)) {
                let isT1 = b.final.team1 === t1;
                updatedBracket.final = { ...b.final, score1: isT1 ? scoreToUse1 : scoreToUse2, score2: isT1 ? scoreToUse2 : scoreToUse1, winner: updatedM.winner };
                updatedBracket.champion = updatedM.winner;
                slotFound = true;
              }
            }

            if (slotFound) {
              updatedBrackets[bIndex] = updatedBracket;
              nextDb.brackets = updatedBrackets;
            }
          }
        }
      }

      // 3. Activity log
      if (params.activityLogMessage) {
        const newId = nextDb.activityLogs.length > 0 ? Math.max(...nextDb.activityLogs.map(l => l.id)) + 1 : 1;
        nextDb.activityLogs = [{ id: newId, message: params.activityLogMessage, timestamp: new Date().toISOString() }, ...nextDb.activityLogs].slice(0, 50);
      }

      return nextDb;
    }, true);

    setTimeout(() => {
      const match = latestDbRef.current?.matches.find(m => m.match_id === params.matchId);
      if (match) {
        const t1 = latestDbRef.current?.teams.find(t => t.team_id === match.team1_id);
        const t2 = latestDbRef.current?.teams.find(t => t.team_id === match.team2_id);
        
        let message = "";
        if (params.scoreTeam1 !== undefined || params.scoreTeam2 !== undefined) {
          const scoreDisplay = match.sport !== "Basketball" 
            ? `Sets: ${match.t1_rounds || 0}-${match.t2_rounds || 0} (Pts: ${match.score_team1}-${match.score_team2})`
            : `${match.score_team1} - ${match.score_team2}`;
          message = `🎯 Live Score Recorded: ${t1?.team_name || "Team 1"} vs ${t2?.team_name || "Team 2"} (${scoreDisplay})`;
        } else if (params.recentAction) {
          message = `⚡ Action Recorded: ${params.recentAction.player_name} (${params.recentAction.action})`;
        } else if (params.activityLogMessage) {
          message = `📝 ${params.activityLogMessage}`;
        } else {
          message = `✅ Live match updated successfully`;
        }
        
        addAdminNotification(message, "success");
      }
    }, 50);
  }, [addAdminNotification, setDbAndSync]);

  const exportDatabaseJSON = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    const dateStr = new Date().toISOString().split("T")[0];
    downloadAnchor.setAttribute("download", `multisports_tournament_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addAdminNotification("Complete tournament records exported as JSON backup!", "success");
  }, [db, addAdminNotification]);

  const importDatabaseJSON = useCallback(async (importedDb: Database) => {
    try {
      if (!importedDb.sports || !importedDb.teams || !importedDb.matches) {
        throw new Error("Invalid tournament backup JSON format");
      }
      const updated = {
        ...importedDb,
        lastUpdated: Date.now()
      };
      setDbAndSync(updated, true);
      addAdminNotification("Database imported successfully and synced to cloud!", "success");
      return true;
    } catch (err: any) {
      addAdminNotification(`Import failed: ${err.message}`, "warning");
      return false;
    }
  }, [setDbAndSync, addAdminNotification]);

  const forceSyncToCloud = useCallback(async () => {
    try {
      const docRef = doc(firestoreDb, FIRESTORE_DOC_ID);
      await setDoc(docRef, latestDbRef.current);
      addAdminNotification("All records successfully pushed and synced to Firestore!", "success");
      return true;
    } catch (err: any) {
      addAdminNotification(`Cloud sync failed: ${err.message}`, "warning");
      return false;
    }
  }, [addAdminNotification]);

  const transferToNewFirebase = useCallback(async (targetConfig: any) => {
    try {
      const { uploadDataToTargetFirebase } = await import("../lib/firebase");
      await uploadDataToTargetFirebase(targetConfig, latestDbRef.current);
      localStorage.setItem("custom_firebase_config", JSON.stringify(targetConfig));
      try {
        sessionStorage.removeItem("firestore_quota_exceeded");
      } catch {}
      quotaExceeded = false;
      if (globalSetQuotaExceeded) {
        globalSetQuotaExceeded(false);
      }
      addAdminNotification("All data transferred to new Firebase project successfully!", "success");
      return { success: true };
    } catch (err: any) {
      console.error("Transfer error", err);
      return { success: false, error: err.message || String(err) };
    }
  }, [addAdminNotification]);

  const contextValue = useMemo(() => ({
    db, 
    loading,
    isQuotaExceeded,
    adminNotifications,
    addAdminNotification,
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
    deleteReferee,
    recordLiveGameAction,
    exportDatabaseJSON,
    importDatabaseJSON,
    forceSyncToCloud,
    transferToNewFirebase
  }), [
    db, 
    loading,
    isQuotaExceeded,
    adminNotifications,
    addAdminNotification,
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
    deleteReferee,
    recordLiveGameAction,
    exportDatabaseJSON,
    importDatabaseJSON,
    forceSyncToCloud,
    transferToNewFirebase
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
