import { useState, useEffect } from "react";

export const SPORTS = ["Basketball","Volleyball","Table Tennis","Badminton","Sepak Takraw","Arnis","Taekwondo"];
export const S_ICONS = { Basketball:"🏀", Volleyball:"🏐", "Table Tennis":"🏓", Badminton:"🏸", "Sepak Takraw":"⚽", Arnis:"⚔️", Taekwondo:"🥋" };
export const S_STATS = {
  Basketball:["points","rebounds","assists","steals","blocks","fouls","substitutions"],
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
  const allNames = [
    "Alejandro, Febe Ronile Cape", "Andalecio, Ellah Atanacio", "Añora, James Aloquina", 
    "Asuro, Leianne Grace Dianne Villanueva", "Aurora, Heinz De Guzman", "Bagolcol, Niel Bryan Puada", 
    "Belonio, Ereca", "Bultron, Richard Jr. Martinez", "Burata, Michael Ocbeña", 
    "Conte, Brenn Xerxes Lee Borja", "Crespo, Gwen Mark", "Dacles, John Paolo Mayo", 
    "Dela Cruz, Jessica Mae Egonia", "Dela Cruz, Melody", "Espinosa, B-Boy", 
    "Fajarillo, Jr Quianchon", "Flores, Dodie Villanueva", "Fuentes, Fuena Mae", 
    "Garcia, Rico Odfeminina", "Gaspar, Mary Grace Ubal", "Gonzales, Elhyn Malabor", 
    "Lalangan, Christian Paul Garcia", "Lantoria, Janah Mae", "Lasala, Christy", 
    "Lavado, Stephen Patriarca", "Lavalle, Ramon Matthew Legarda", "Losala, Jayxielle Radzy Dela Cruz", 
    "Lozada, Lenard Gabais", "Macahilig, Christian Dorado", "Marcelino, Chery Joy Mauricio", 
    "Marquez, Kayle Bautista", "Mora, Ryan James Orbin", "Onayan, Chris Villeza", 
    "Oseta, Loraine", "Oseta, Shanna Trace Salaya", "Panado, Ryna Mae Tantio", 
    "Sangrones, Carmela", "Tolentino, Marlita Mae Olithao", "Tuvera, Charlotte Alexis Navarra", 
    "Villa, Armond Estocada"
  ];
  
  const teams: any[] = [];
  const players: any[] = [];
  let tId = 1;
  let pId = 1;

  SPORTS.forEach(sport => {
    teamNames.forEach(tName => {
      teams.push({ team_id: tId, team_name: tName, sport, coach_name: "Coach " + tName.split(" ")[1] });
      
      for (let i=0; i<3; i++) {
        const isMartialArt = sport === "Taekwondo" || sport === "Arnis";
        const isWomen = i % 2 !== 0; 
        const gender = isWomen ? "Female" : "Male";
        const name = allNames[(pId - 1) % allNames.length];
        
        let jersey_number: string | number = Math.floor(Math.random() * 99) + 1;
        if (isMartialArt) {
          jersey_number = i % 2 === 0 ? "Red" : "Blue";
        }
        
        players.push({
          player_id: pId++,
          player_name: name,
          team_id: tId,
          sport,
          jersey_number,
          gender
        });
      }
      tId++;
    });
  });

  const matches = [
    {match_id:1,sport:"Basketball",team1_id:1,team2_id:2,match_date:"10/25/24",score_team1:85,score_team2:82,winner:"Ab-tect thunders",status:"completed",game_label:"Elimination Round 1",category:"Men's Division",venue:"Main Gym",referee:"John Smith"},
    {match_id:2,sport:"Volleyball",team1_id:5,team2_id:6,match_date:"10/26/24",score_team1:3,score_team2:1,winner:"Ab-tect thunders",status:"completed",game_label:"Elimination Round 1",category:"Women's Division",venue:"Gym B",referee:"Emily Chen"},
    {match_id:3,sport:"Taekwondo",team1_id:25,team2_id:26,match_date:"10/27/24",score_team1:0,score_team2:0,winner:null,status:"live",game_label:"Quarter Finals",category:"Men's Division",venue:"Martial Arts Arena",referee:"Master Kim"},
    {match_id:4,sport:"Arnis",team1_id:21,team2_id:22,match_date:"10/28/24",score_team1:0,score_team2:0,winner:null,status:"upcoming",game_label:"Round 1",category:"Women's Division",venue:"Gym B"}
  ];

  const playerStats = [
    {stat_id:1,player_id:1,match_id:1,sport:"Basketball",points:24,rebounds:10,assists:5,steals:2},
    {stat_id:2,player_id:2,match_id:1,sport:"Basketball",points:15,rebounds:4,assists:8},
    {stat_id:3,player_id:13,match_id:2,sport:"Volleyball",points:10,kills:14,aces:3,blocks:2,errors:1},
    {stat_id:4,player_id:14,match_id:2,sport:"Volleyball",points:12,kills:10,aces:1,blocks:4,errors:3},
  ];
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
  const finalsGames = [
    {sport:"Basketball",game:"Game 1",winner:"AB-TECT THUNDERS",scoreA:107,scoreB:96,loser:"COMSOA D' MAROON"},
    {sport:"Basketball",game:"Game 2",winner:"AB-TECT THUNDERS",scoreA:110,scoreB:101,loser:"COMSOA D' MAROON"},
    {sport:"Basketball",game:"Game 3",winner:"AB-TECT THUNDERS",scoreA:105,scoreB:99,loser:"COMSOA D' MAROON"},
    {sport:"Basketball",game:"Game 4",winner:"COMSOA D' MAROON",scoreA:108,scoreB:88,loser:"AB-TECT THUNDERS"},
    {sport:"Basketball",game:"Game 5",winner:"AB-TECT THUNDERS",scoreA:106,scoreB:98,loser:"COMSOA D' MAROON"},
  ];
  const brackets = [
    {
      sport: "Basketball",
      qf:[
        { team1: "Ab-tect thunders", team2: "Comsoa D' Maroon", score1: 102, score2: 98, winner: "Ab-tect thunders" },
        { team1: "Techtitans", team2: "Scisoa foxes", score1: 88, score2: 85, winner: "Techtitans" },
        { team1: "Ab-tect thunders", team2: "Techtitans", score1: 95, score2: 90, winner: "Ab-tect thunders" },
        { team1: "Comsoa D' Maroon", team2: "Scisoa foxes", score1: 78, score2: 82, winner: "Scisoa foxes" }
      ],
      sf:[
        { team1: "Ab-tect thunders", team2: "Techtitans", score1: 110, score2: 105, winner: "Ab-tect thunders" },
        { team1: "Comsoa D' Maroon", team2: "Scisoa foxes", score1: 92, score2: 88, winner: "Comsoa D' Maroon" }
      ],
      final: { team1: "Ab-tect thunders", team2: "Comsoa D' Maroon", score1: 106, score2: 98, winner: "Ab-tect thunders" },
      champion: "Ab-tect thunders",
    },
    {
      sport: "Volleyball",
      qf:[
        { team1: "Ab-tect thunders", team2: "Comsoa D' Maroon", score1: 3, score2: 1, winner: "Ab-tect thunders" },
        { team1: "Techtitans", team2: "Scisoa foxes", score1: 2, score2: 3, winner: "Scisoa foxes" },
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" }
      ],
      sf:[
        { team1: "Ab-tect thunders", team2: "Scisoa foxes", score1: 3, score2: 2, winner: "Ab-tect thunders" },
        { team1: "Comsoa D' Maroon", team2: "Techtitans", score1: 3, score2: 1, winner: "Comsoa D' Maroon" }
      ],
      final: { team1: "Ab-tect thunders", team2: "Comsoa D' Maroon", score1: 3, score2: 2, winner: "Ab-tect thunders" },
      champion: "Ab-tect thunders",
    },
    {
      sport: "Taekwondo",
      qf:[
        { team1: "Ab-tect thunders", team2: "Comsoa D' Maroon", score1: 15, score2: 10, winner: "Ab-tect thunders" },
        { team1: "Techtitans", team2: "Scisoa foxes", score1: 8, score2: 12, winner: "Scisoa foxes" },
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" }
      ],
      sf:[
        { team1: "Ab-tect thunders", team2: "Scisoa foxes", score1: 18, score2: 16, winner: "Ab-tect thunders" },
        { team1: "Comsoa D' Maroon", team2: "Techtitans", score1: 12, score2: 15, winner: "Techtitans" }
      ],
      final: { team1: "Ab-tect thunders", team2: "Techtitans", score1: 22, score2: 20, winner: "Ab-tect thunders" },
      champion: "Ab-tect thunders",
    },
    {
      sport: "Table Tennis",
      qf:[
        { team1: "Ab-tect thunders", team2: "Comsoa D' Maroon", score1: 3, score2: 0, winner: "Ab-tect thunders" },
        { team1: "Techtitans", team2: "Scisoa foxes", score1: 1, score2: 3, winner: "Scisoa foxes" },
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" }
      ],
      sf:[
        { team1: "Ab-tect thunders", team2: "Scisoa foxes", score1: 3, score2: 2, winner: "Ab-tect thunders" },
        { team1: "Comsoa D' Maroon", team2: "Techtitans", score1: 0, score2: 3, winner: "Techtitans" }
      ],
      final: { team1: "Ab-tect thunders", team2: "Techtitans", score1: 3, score2: 1, winner: "Ab-tect thunders" },
      champion: "Ab-tect thunders",
    },
    {
      sport: "Chess",
      qf:[
        { team1: "Ab-tect thunders", team2: "Comsoa D' Maroon", score1: 4, score2: 0, winner: "Ab-tect thunders" },
        { team1: "Techtitans", team2: "Scisoa foxes", score1: 2, score2: 2, winner: "Techtitans" },
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" }
      ],
      sf:[
        { team1: "Ab-tect thunders", team2: "Techtitans", score1: 3, score2: 1, winner: "Ab-tect thunders" },
        { team1: "Scisoa foxes", team2: "Comsoa D' Maroon", score1: 2, score2: 2, winner: "Scisoa foxes" }
      ],
      final: { team1: "Ab-tect thunders", team2: "Scisoa foxes", score1: 3, score2: 1, winner: "Ab-tect thunders" },
      champion: "Ab-tect thunders",
    },
    {
      sport: "Athletics",
      qf:[
        { team1: "Ab-tect thunders", team2: "Comsoa D' Maroon", score1: 10, score2: 8, winner: "Ab-tect thunders" },
        { team1: "Techtitans", team2: "Scisoa foxes", score1: 5, score2: 12, winner: "Scisoa foxes" },
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" },
        { team1: "", team2: "", score1: 0, score2: 0, winner: "" }
      ],
      sf:[
        { team1: "Ab-tect thunders", team2: "Scisoa foxes", score1: 14, score2: 10, winner: "Ab-tect thunders" },
        { team1: "Comsoa D' Maroon", team2: "Techtitans", score1: 12, score2: 13, winner: "Techtitans" }
      ],
      final: { team1: "Ab-tect thunders", team2: "Techtitans", score1: 16, score2: 14, winner: "Ab-tect thunders" },
      champion: "Ab-tect thunders",
    }
  ];
  const sports = SPORTS;
  return { sports, teams, players, matches, playerStats, standings: stands, users, finalsGames, brackets, activityLogs: [], referees };
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
