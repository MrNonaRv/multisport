import { useState, useEffect } from "react";

export const SPORTS = ["Basketball","Volleyball","Table Tennis","Badminton","Sepak Takraw","Arnis","Taekwondo"];
export const S_ICONS = { Basketball:"🏀", Volleyball:"🏐", "Table Tennis":"🏓", Badminton:"🏸", "Sepak Takraw":"⚽", Arnis:"⚔️", Taekwondo:"🥋" };
export const S_STATS = {
  Basketball:["points","rebounds","assists","steals","blocks","fouls"],
  Volleyball:["points","kills","blocks","aces","errors"],
  "Table Tennis":["points","aces","smashes","service_wins"],
  Badminton:["points","smashes","drops","clears"],
  "Sepak Takraw":["points","kicks","headers","rolls"],
  Arnis:["points","strikes","blocks","disarms"],
  Taekwondo:["points","kicks","punches","gam_jeom"],
};
export const COLORS = {
  Basketball: "#F97316",
  Volleyball: "#8B5CF6",
  "Table Tennis": "#10B981",
  Badminton: "#3B82F6",
  "Sepak Takraw": "#EC4899",
  Arnis: "#EF4444",
  Taekwondo: "#F59E0B"
};
export const SPORT_THEMES: Record<string, { bg: string, gradient: string[], accent: string, icon: string, patternColor: string, bgImage: string }> = {
  Basketball: {
    bg: "var(--panel-bg)",
    gradient: ["var(--panel-bg)", "var(--bg)", "var(--panel-bg)"],
    accent: "#f97316",
    icon: "🏀",
    patternColor: "rgba(249,115,22,0.1)",
    bgImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1920&auto=format&fit=crop"
  },
  Volleyball: {
    bg: "var(--panel-bg)",
    gradient: ["var(--panel-bg)", "var(--bg)", "var(--panel-bg)"],
    accent: "#8b5cf6",
    icon: "🏐",
    patternColor: "rgba(139,92,246,0.1)",
    bgImage: "https://images.unsplash.com/photo-1592656631147-f1aa240f9d10?q=80&w=1920&auto=format&fit=crop"
  },
  Badminton: {
    bg: "var(--panel-bg)",
    gradient: ["var(--panel-bg)", "var(--bg)", "var(--panel-bg)"],
    accent: "#3b82f6",
    icon: "🏸",
    patternColor: "rgba(59,130,246,0.1)",
    bgImage: "https://images.unsplash.com/photo-1626225967045-9410dd99fa70?q=80&w=1920&auto=format&fit=crop"
  },
  "Table Tennis": {
    bg: "var(--panel-bg)",
    gradient: ["var(--panel-bg)", "var(--bg)", "var(--panel-bg)"],
    accent: "#10b981",
    icon: "🏓",
    patternColor: "rgba(16,185,129,0.1)",
    bgImage: "https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=1920&auto=format&fit=crop"
  },
  "Sepak Takraw": {
    bg: "var(--panel-bg)",
    gradient: ["var(--panel-bg)", "var(--bg)", "var(--panel-bg)"],
    accent: "#db2777",
    icon: "⚽",
    patternColor: "rgba(219,39,119,0.1)",
    bgImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1920&auto=format&fit=crop"
  },
  Arnis: {
    bg: "var(--panel-bg)",
    gradient: ["var(--panel-bg)", "var(--bg)", "var(--panel-bg)"],
    accent: "#dc2626",
    icon: "⚔️",
    patternColor: "rgba(220,38,38,0.1)",
    bgImage: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=1920&auto=format&fit=crop"
  },
  Taekwondo: {
    bg: "var(--panel-bg)",
    gradient: ["var(--panel-bg)", "var(--bg)", "var(--panel-bg)"],
    accent: "#f59e0b",
    icon: "🥋",
    patternColor: "rgba(245,158,11,0.1)",
    bgImage: "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?q=80&w=1920&auto=format&fit=crop"
  },
  Chess: {
    bg: "var(--panel-bg)",
    gradient: ["var(--panel-bg)", "var(--bg)", "var(--panel-bg)"],
    accent: "#94a3b8",
    icon: "♟️",
    patternColor: "rgba(148,163,184,0.1)",
    bgImage: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1920&auto=format&fit=crop"
  },
  Athletics: {
    bg: "var(--panel-bg)",
    gradient: ["var(--panel-bg)", "var(--bg)", "var(--panel-bg)"],
    accent: "#06b6d4",
    icon: "🏃",
    patternColor: "rgba(6,182,212,0.1)",
    bgImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1920&auto=format&fit=crop"
  }
};
export const BSK_COLORS = {
  "Ab-tect thunders":{bg:"#1a1a2e",accent:"#F97316"},
  "Comsoa D' Maroon":{bg:"#2d0a0a",accent:"#ef4444"},
  "Techtitans":{bg:"#0f2040",accent:"#38bdf8"},
  "Scisoa foxes":{bg:"#451a03",accent:"#f59e0b"},
  "Falcons":{bg:"#1a1a2e",accent:"#F97316"},
  "Thunderbolts":{bg:"#0f2040",accent:"#38bdf8"},
  "Kalye Bomba":{bg:"#7c2d12",accent:"#f97316"},
  "Lightning RSL":{bg:"#000",accent:"#fbbf24"},
  "Luisa's Park":{bg:"#4c1d95",accent:"#a78bfa"},
  "Proper":{bg:"#0c4a6e",accent:"#38bdf8"},
  "Railways Home":{bg:"#14532d",accent:"#4ade80"},
  "Sitio Baklayan":{bg:"#7f1d1d",accent:"#f87171"},
  "Team Matnog":{bg:"#1e3a5f",accent:"#60a5fa"},
  "The Big House Team":{bg:"#1c1917",accent:"#f59e0b"},
};

export function initDB() {
  const teamNames = ["Ab-tect thunders", "Comsoa D' Maroon", "Techtitans", "Scisoa foxes"];
  const girlsNames = [
    "Alejandro, Febe Ronile Cape", "Andalecio, Ellah Atanacio", "Asuro, Leianne Grace Dianne Villanueva",
    "Belonio, Ereca", "Dela Cruz, Jessica Mae Egonia", "Dela Cruz, Melody", "Fuentes, Fuena Mae",
    "Gaspar, Mary Grace Ubal", "Gonzales, Elhyn Malabor", "Lantoria, Janah Mae", "Lasala, Christy",
    "Marcelino, Chery Joy Mauricio", "Oseta, Loraine", "Oseta, Shanna Trace Salaya", "Panado, Ryna Mae Tantio",
    "Sangrones, Carmela", "Tolentino, Marlita Mae Olithao", "Tuvera, Charlotte Alexis Navarra"
  ];
  
  const boysNames = [
    "Villa, Armond Estocada", "Onayan, Chris Villeza", "Marquez, Kayle Bautista", "Mora, Ryan James Orbin",
    "Lavado, Stephen Patriarca", "Lavalle, Ramon Matthew Legarda", "Losala, Jayxielle Radzy Dela Cruz",
    "Lozada, Lenard Gabais", "Macahilig, Christian Dorado", "Lalangan, Christian Paul Garcia",
    "Garcia, Rico Odfeminina", "Espinosa, B-Boy", "Fajarillo, Jr Quianchon", "Flores, Dodie Villanueva",
    "Bultron, Richard Jr. Martinez", "Burata, Michael Ocbeña", "Conte, Brenn Xerxes Lee Borja",
    "Crespo, Gwen Mark", "Dacles, John Paolo Mayo", "Aurora, Heinz De Guzman", "Bagolcol, Niel Bryan Puada",
    "Añora, James Aloquina"
  ];
  
  const teams: any[] = [];
  const players: any[] = [];
  let tId = 1;
  let pId = 1;

  SPORTS.forEach(sport => {
    teamNames.forEach(tName => {
      teams.push({ team_id: tId, team_name: tName, sport, coach_name: "Coach " + tName.split(" ")[1] });
      
      for (let i=0; i<4; i++) {
        const isMartialArt = sport === "Taekwondo" || sport === "Arnis";
        const isWomen = i % 2 !== 0; 
        const gender = isWomen ? "Female" : "Male";
        
        let name = "Player " + pId;
        if (gender === "Female") {
          name = girlsNames[(pId - 1) % girlsNames.length];
        } else {
          name = boysNames[(pId - 1) % boysNames.length];
        }
        
        let jersey_number: string | number = Math.floor(Math.random() * 99) + 1;
        if (isMartialArt) {
          jersey_number = i % 2 === 0 ? "Red" : "Blue";
        }
        
        players.push({
          player_id: pId++,
          player_name: name,
          team_id: tId,
          sport,
      category: "Men's Division",
          jersey_number,
          gender
        });
      }
      tId++;
    });
  });

  let mId = 1;
  const matches: any[] = [];
  const playerStats: any[] = [];
  const stands = teams.map((t, i) => {
    const won = matches.filter(m => m.status === "completed" && m.winner === t.team_name).length;
    const lost = matches.filter(m => m.status === "completed" && (m.team1_id === t.team_id || m.team2_id === t.team_id) && m.winner && m.winner !== t.team_name).length;
    const total = won + lost;
    return { standing_id: i+1, team_id: t.team_id, wins: won, losses: lost, win_percentage: total > 0 ? +(won/total*100).toFixed(1) : 0 };
  });

  const referees = [
    { referee_id: 1, name: "John Smith", sport: "Basketball" },
    { referee_id: 2, name: "Mike Davis", sport: "Basketball" },
    { referee_id: 3, name: "Sarah Jones", sport: "Basketball" },
    { referee_id: 4, name: "Emily Chen", sport: "Volleyball" },
    { referee_id: 5, name: "David Lee", sport: "Badminton" },
    { referee_id: 6, name: "Master Kim", sport: "Taekwondo" },
    { referee_id: 7, name: "Lisa Wong", sport: "Table Tennis" },
  ];

  const users = [
    {user_id:1,name:"Admin User",email:"admin@sportsmetrics.com",password:"admin123",role:"ADMIN"},
    {user_id:2,name:"Tab Reyes",email:"tab@sportsmetrics.com",password:"tab123",role:"TABULATOR"},
  ];
  
  const brackets = SPORTS.map(sport => {
    const sportTeams = teams.filter(t => t.sport === sport);
    return {
      sport,
      category: "Men's Division",
      qf: [
        { team1: sportTeams[0]?.team_name || "", team2: sportTeams[1]?.team_name || "", score1: 0, score2: 0, winner: "" },
        { team1: sportTeams[2]?.team_name || "", team2: sportTeams[3]?.team_name || "", score1: 0, score2: 0, winner: "" },
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" }
      ],
      sf: [
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" }
      ],
      final: { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
      champion: ""
    };
  });
  const sports = SPORTS;
  return { sports, teams, players, matches, playerStats, users, brackets, activityLogs: [], referees };
}

export function useW() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}
