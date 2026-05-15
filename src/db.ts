import { useState, useEffect } from "react";

export const SPORTS = ["Basketball","Volleyball","Table Tennis","Badminton","Sepak Takraw","Arnis","Taekwondo"];
export const S_ICONS = { Basketball:"🏀", Volleyball:"🏐", "Table Tennis":"🏓", Badminton:"🏸", "Sepak Takraw":"⚽", Arnis:"⚔️", Taekwondo:"🥋" };
export const S_STATS = {
  Basketball:["points","rebounds","assists","steals","blocks","fouls","substitutions"],
  Volleyball:["kills","digs","aces","blocks","assists","fouls"],
  "Table Tennis":["points","aces","smashes","service_wins"],
  Badminton:["points","smashes","drops","clears"],
  "Sepak Takraw":["points","kicks","headers","rolls"],
  Arnis:["points","strikes","blocks","disarms"],
  Taekwondo:["points","kicks","punches","knockdowns"],
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
  const teams = [
    {team_id:1,team_name:"Falcons",sport:"Basketball",coach_name:"Coach Rivera"},
    {team_id:2,team_name:"Thunderbolts",sport:"Basketball",coach_name:"Coach Santos"},
    {team_id:3,team_name:"Kalye Bomba",sport:"Basketball",coach_name:"Coach Cruz"},
    {team_id:4,team_name:"Lightning RSL",sport:"Basketball",coach_name:"Coach Flores"},
    {team_id:5,team_name:"Luisa's Park",sport:"Basketball",coach_name:"Coach Dela Rosa"},
    {team_id:6,team_name:"Proper",sport:"Basketball",coach_name:"Coach Tan"},
    {team_id:7,team_name:"Railways Home",sport:"Basketball",coach_name:"Coach Reyes"},
    {team_id:8,team_name:"Sitio Baklayan",sport:"Basketball",coach_name:"Coach Ocampo"},
    {team_id:9,team_name:"Team Matnog",sport:"Basketball",coach_name:"Coach Lim"},
    {team_id:10,team_name:"The Big House Team",sport:"Basketball",coach_name:"Coach Park"},
    {team_id:11,team_name:"Aces",sport:"Volleyball",coach_name:"Coach Dela Cruz"},
    {team_id:12,team_name:"Spikes",sport:"Volleyball",coach_name:"Coach Mendoza"},
    {team_id:13,team_name:"Smashers",sport:"Badminton",coach_name:"Coach Bautista"},
    {team_id:14,team_name:"Shuttlers",sport:"Badminton",coach_name:"Coach Lim"},
    {team_id:15,team_name:"Dragons",sport:"Taekwondo",coach_name:"Coach Park"},
    {team_id:16,team_name:"Scorpions",sport:"Taekwondo",coach_name:"Coach Kim"},
    {team_id:17,team_name:"Raptors",sport:"Table Tennis",coach_name:"Coach Wu"},
    {team_id:18,team_name:"Blazers",sport:"Table Tennis",coach_name:"Coach Chen"},
  ];
  const players = [
    {player_id:1,player_name:"Juan dela Cruz",team_id:1,sport:"Basketball",jersey_number:7},
    {player_id:2,player_name:"Miguel Santos",team_id:1,sport:"Basketball",jersey_number:12},
    {player_id:3,player_name:"Nico Garcia",team_id:1,sport:"Basketball",jersey_number:23},
    {player_id:4,player_name:"Carlo Reyes",team_id:2,sport:"Basketball",jersey_number:5},
    {player_id:5,player_name:"Paolo Manalo",team_id:2,sport:"Basketball",jersey_number:21},
    {player_id:6,player_name:"Neal Patrick Golero",team_id:7,sport:"Basketball",jersey_number:24},
    {player_id:7,player_name:"Bawi Golero",team_id:7,sport:"Basketball",jersey_number:2},
    {player_id:8,player_name:"John Loyd Golero",team_id:7,sport:"Basketball",jersey_number:34},
    {player_id:9,player_name:"John Loyd Denaga",team_id:7,sport:"Basketball",jersey_number:9},
    {player_id:10,player_name:"Mat-Mat Golero",team_id:7,sport:"Basketball",jersey_number:8},
    {player_id:11,player_name:"Dodoy Langorayan",team_id:7,sport:"Basketball",jersey_number:3},
    {player_id:12,player_name:"Jojo Asquilon",team_id:7,sport:"Basketball",jersey_number:14},
    {player_id:13,player_name:"Yan-Yan Olivera",team_id:7,sport:"Basketball",jersey_number:5},
    {player_id:14,player_name:"Mike Solomon",team_id:7,sport:"Basketball",jersey_number:17},
    {player_id:15,player_name:"Steve Candelario",team_id:7,sport:"Basketball",jersey_number:27},
    {player_id:16,player_name:"Chud Golero",team_id:7,sport:"Basketball",jersey_number:35},
    {player_id:17,player_name:"John Rex Solomon",team_id:7,sport:"Basketball",jersey_number:4},
    {player_id:18,player_name:"Franzel Beluso",team_id:3,sport:"Basketball",jersey_number:5},
    {player_id:19,player_name:"Vincent Estrella",team_id:3,sport:"Basketball",jersey_number:6},
    {player_id:20,player_name:"Christian Estrella",team_id:3,sport:"Basketball",jersey_number:27},
    {player_id:21,player_name:"Hansel Hablo",team_id:3,sport:"Basketball",jersey_number:20},
    {player_id:22,player_name:"Miguel Ballon",team_id:4,sport:"Basketball",jersey_number:11},
    {player_id:23,player_name:"Jade Canindo",team_id:5,sport:"Basketball",jersey_number:79},
    {player_id:24,player_name:"Marcus Fortaleza",team_id:6,sport:"Basketball",jersey_number:77},
    {player_id:25,player_name:"Khevin Bagamasmad",team_id:8,sport:"Basketball",jersey_number:10},
    {player_id:26,player_name:"Remart Hordejan",team_id:9,sport:"Basketball",jersey_number:17},
    {player_id:27,player_name:"Andrian Amparo",team_id:10,sport:"Basketball",jersey_number:1},
    {player_id:28,player_name:"Patrick Golero",team_id:10,sport:"Basketball",jersey_number:8},
    {player_id:29,player_name:"Ana Gomez",team_id:11,sport:"Volleyball",jersey_number:3},
    {player_id:30,player_name:"Maria Cruz",team_id:11,sport:"Volleyball",jersey_number:9},
    {player_id:31,player_name:"Sofia Reyes",team_id:12,sport:"Volleyball",jersey_number:1},
    {player_id:32,player_name:"Ken Matsuda",team_id:13,sport:"Badminton",jersey_number:1},
    {player_id:33,player_name:"Rex Chua",team_id:14,sport:"Badminton",jersey_number:1},
    {player_id:34,player_name:"Jin Park",team_id:15,sport:"Taekwondo",jersey_number:1},
    {player_id:35,player_name:"Lee Sung",team_id:16,sport:"Taekwondo",jersey_number:1},
    {player_id:36,player_name:"Mei Ling",team_id:17,sport:"Table Tennis",jersey_number:1},
    {player_id:37,player_name:"Wei Zhang",team_id:18,sport:"Table Tennis",jersey_number:1},
  ];
  const matches = [
    {match_id:1,sport:"Basketball",team1_id:1,team2_id:2,match_date:"2025-06-10",score_team1:107,score_team2:96,winner:"Falcons",status:"completed",game_label:"Game 1",venue:"City Arena",referee:"John Smith"},
    {match_id:2,sport:"Basketball",team1_id:1,team2_id:2,match_date:"2025-06-12",score_team1:110,score_team2:101,winner:"Falcons",status:"completed",game_label:"Game 2",venue:"City Arena",referee:"Mike Davis"},
    {match_id:3,sport:"Basketball",team1_id:1,team2_id:2,match_date:"2025-06-14",score_team1:105,score_team2:99,winner:"Falcons",status:"completed",game_label:"Game 3",venue:"Downtown Court",referee:"Sarah Jones"},
    {match_id:4,sport:"Basketball",team1_id:2,team2_id:1,match_date:"2025-06-16",score_team1:108,score_team2:88,winner:"Thunderbolts",status:"completed",game_label:"Game 4",venue:"Downtown Court",referee:"John Smith"},
    {match_id:5,sport:"Basketball",team1_id:1,team2_id:2,match_date:"2025-06-18",score_team1:106,score_team2:98,winner:"Falcons",status:"completed",game_label:"Game 5",venue:"City Arena",referee:"Mike Davis"},
    {match_id:6,sport:"Basketball",team1_id:3,team2_id:4,match_date:"2025-06-20",score_team1:88,score_team2:75,winner:"Kalye Bomba",status:"completed",game_label:"QF 1",venue:"Local Gym",referee:"Tom Wilson"},
    {match_id:7,sport:"Basketball",team1_id:5,team2_id:6,match_date:"2025-06-21",score_team1:42,score_team2:38,winner:null,status:"live",game_label:"QF 2",venue:"Local Gym",referee:"Sarah Jones"},
    {match_id:8,sport:"Volleyball",team1_id:11,team2_id:12,match_date:"2025-06-11",score_team1:25,score_team2:21,winner:"Aces",status:"completed",game_label:"Game 1",venue:"Sports Complex",referee:"Emily Chen"},
    {match_id:9,sport:"Badminton",team1_id:13,team2_id:14,match_date:"2025-06-13",score_team1:21,score_team2:18,winner:"Smashers",status:"completed",game_label:"Game 1",venue:"Racket Club",referee:"David Lee"},
    {match_id:10,sport:"Taekwondo",team1_id:15,team2_id:16,match_date:"2025-06-14",score_team1:12,score_team2:9,winner:"Dragons",status:"completed",game_label:"Match 1",venue:"Martial Arts Center",referee:"Master Kim"},
    {match_id:11,sport:"Table Tennis",team1_id:17,team2_id:18,match_date:"2025-06-14",score_team1:11,score_team2:8,winner:"Raptors",status:"completed",game_label:"Match 1",venue:"Community Hall",referee:"Lisa Wong"},
    {match_id:12,sport:"Volleyball",team1_id:11,team2_id:12,match_date:"2025-06-22",score_team1:0,score_team2:0,winner:null,status:"upcoming",game_label:"Game 2",venue:"Sports Complex",referee:"Emily Chen"},
  ];
  const playerStats = [
    {stat_id:1,player_id:1,match_id:1,sport:"Basketball",points:28,rebounds:5,assists:7,steals:2,blocks:1},
    {stat_id:2,player_id:2,match_id:1,sport:"Basketball",points:15,rebounds:8,assists:3,steals:1,blocks:3},
    {stat_id:3,player_id:4,match_id:1,sport:"Basketball",points:20,rebounds:6,assists:2,steals:3,blocks:0},
    {stat_id:4,player_id:1,match_id:2,sport:"Basketball",points:18,rebounds:4,assists:5,steals:1,blocks:2},
    {stat_id:5,player_id:18,match_id:6,sport:"Basketball",points:137,rebounds:32,assists:18,steals:9,blocks:5},
    {stat_id:6,player_id:19,match_id:6,sport:"Basketball",points:131,rebounds:28,assists:22,steals:7,blocks:3},
    {stat_id:7,player_id:20,match_id:6,sport:"Basketball",points:129,rebounds:30,assists:15,steals:6,blocks:4},
    {stat_id:8,player_id:23,match_id:6,sport:"Basketball",points:124,rebounds:25,assists:19,steals:5,blocks:2},
    {stat_id:9,player_id:22,match_id:6,sport:"Basketball",points:124,rebounds:22,assists:17,steals:8,blocks:1},
    {stat_id:10,player_id:24,match_id:7,sport:"Basketball",points:122,rebounds:20,assists:21,steals:4,blocks:6},
    {stat_id:11,player_id:25,match_id:7,sport:"Basketball",points:119,rebounds:18,assists:16,steals:11,blocks:2},
    {stat_id:12,player_id:27,match_id:7,sport:"Basketball",points:119,rebounds:35,assists:12,steals:3,blocks:7},
    {stat_id:13,player_id:26,match_id:7,sport:"Basketball",points:116,rebounds:27,assists:14,steals:6,blocks:3},
    {stat_id:14,player_id:21,match_id:6,sport:"Basketball",points:111,rebounds:24,assists:20,steals:5,blocks:2},
    {stat_id:15,player_id:28,match_id:7,sport:"Basketball",points:106,rebounds:19,assists:11,steals:4,blocks:5},
    {stat_id:16,player_id:6,match_id:1,sport:"Basketball",points:101,rebounds:16,assists:13,steals:3,blocks:2},
    {stat_id:17,player_id:17,match_id:1,sport:"Basketball",points:101,rebounds:14,assists:10,steals:2,blocks:1},
    {stat_id:18,player_id:29,match_id:8,sport:"Volleyball",kills:14,digs:8,aces:3,blocks:2,assists:5},
    {stat_id:19,player_id:30,match_id:8,sport:"Volleyball",kills:10,digs:12,aces:1,blocks:3,assists:9},
    {stat_id:20,player_id:32,match_id:9,sport:"Badminton",points:21,smashes:8,drops:5,clears:10},
    {stat_id:21,player_id:34,match_id:10,sport:"Taekwondo",points:12,kicks:8,punches:4,knockdowns:2},
    {stat_id:22,player_id:36,match_id:11,sport:"Table Tennis",points:11,aces:4,smashes:6,service_wins:3},
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
    {user_id:1,name:"Admin User",email:"admin@multisports.com",password:"admin123",role:"ADMIN"},
    {user_id:2,name:"Tab Reyes",email:"tab@multisports.com",password:"tab123",role:"TABULATOR"},
  ];
  const finalsGames = [
    {sport:"Basketball",game:"Game 1",winner:"FALCONS",scoreA:107,scoreB:96,loser:"THUNDERBOLTS"},
    {sport:"Basketball",game:"Game 2",winner:"FALCONS",scoreA:110,scoreB:101,loser:"THUNDERBOLTS"},
    {sport:"Basketball",game:"Game 3",winner:"FALCONS",scoreA:105,scoreB:99,loser:"THUNDERBOLTS"},
    {sport:"Basketball",game:"Game 4",winner:"THUNDERBOLTS",scoreA:108,scoreB:88,loser:"FALCONS"},
    {sport:"Basketball",game:"Game 5",winner:"FALCONS",scoreA:106,scoreB:98,loser:"THUNDERBOLTS"},
  ];
  const brackets = [
    {
      sport: "Basketball",
      qf:[
        { team1: "Falcons", team2: "Thunderbolts", score1: 102, score2: 98, winner: "Falcons" },
        { team1: "Kalye Bomba", team2: "Lightning RSL", score1: 88, score2: 85, winner: "Kalye Bomba" },
        { team1: "Luisa's Park", team2: "Proper", score1: 95, score2: 90, winner: "Luisa's Park" },
        { team1: "Railways Home", team2: "Sitio Baklayan", score1: 78, score2: 82, winner: "Sitio Baklayan" }
      ],
      sf:[
        { team1: "Falcons", team2: "Kalye Bomba", score1: 110, score2: 105, winner: "Falcons" },
        { team1: "Luisa's Park", team2: "Sitio Baklayan", score1: 92, score2: 88, winner: "Luisa's Park" }
      ],
      final: { team1: "Falcons", team2: "Luisa's Park", score1: 106, score2: 98, winner: "Falcons" },
      champion: "Falcons",
    },
    {
      sport: "Volleyball",
      qf:[
        { team1: "Spikers", team2: "Diggers", score1: 3, score2: 1, winner: "Spikers" },
        { team1: "Setters", team2: "Blockers", score1: 2, score2: 3, winner: "Blockers" },
        { team1: "Aces", team2: "Servers", score1: 3, score2: 0, winner: "Aces" },
        { team1: "Liberos", team2: "Hitters", score1: 1, score2: 3, winner: "Hitters" }
      ],
      sf:[
        { team1: "Spikers", team2: "Blockers", score1: 3, score2: 2, winner: "Spikers" },
        { team1: "Aces", team2: "Hitters", score1: 3, score2: 1, winner: "Aces" }
      ],
      final: { team1: "Spikers", team2: "Aces", score1: 3, score2: 2, winner: "Spikers" },
      champion: "Spikers",
    },
    {
      sport: "Badminton",
      qf:[
        { team1: "Shuttlers", team2: "Smashers", score1: 2, score2: 0, winner: "Shuttlers" },
        { team1: "Netters", team2: "Birdies", score1: 1, score2: 2, winner: "Birdies" },
        { team1: "Rackets", team2: "Strings", score1: 2, score2: 1, winner: "Rackets" },
        { team1: "Grips", team2: "Frames", score1: 0, score2: 2, winner: "Frames" }
      ],
      sf:[
        { team1: "Shuttlers", team2: "Birdies", score1: 2, score2: 1, winner: "Shuttlers" },
        { team1: "Rackets", team2: "Frames", score1: 1, score2: 2, winner: "Frames" }
      ],
      final: { team1: "Shuttlers", team2: "Frames", score1: 2, score2: 1, winner: "Shuttlers" },
      champion: "Shuttlers",
    },
    {
      sport: "Taekwondo",
      qf:[
        { team1: "Kickers", team2: "Strikers", score1: 15, score2: 10, winner: "Kickers" },
        { team1: "Fists", team2: "Shields", score1: 8, score2: 12, winner: "Shields" },
        { team1: "Belts", team2: "Forms", score1: 20, score2: 5, winner: "Belts" },
        { team1: "Dojs", team2: "Masters", score1: 11, score2: 14, winner: "Masters" }
      ],
      sf:[
        { team1: "Kickers", team2: "Shields", score1: 18, score2: 16, winner: "Kickers" },
        { team1: "Belts", team2: "Masters", score1: 12, score2: 15, winner: "Masters" }
      ],
      final: { team1: "Kickers", team2: "Masters", score1: 22, score2: 20, winner: "Kickers" },
      champion: "Kickers",
    },
    {
      sport: "Table Tennis",
      qf:[
        { team1: "Paddlers", team2: "Spinners", score1: 3, score2: 0, winner: "Paddlers" },
        { team1: "Loopers", team2: "Choppers", score1: 1, score2: 3, winner: "Choppers" },
        { team1: "Servers", team2: "Receivers", score1: 3, score2: 2, winner: "Servers" },
        { team1: "Smashers", team2: "Blockers", score1: 3, score2: 1, winner: "Smashers" }
      ],
      sf:[
        { team1: "Paddlers", team2: "Choppers", score1: 3, score2: 2, winner: "Paddlers" },
        { team1: "Servers", team2: "Smashers", score1: 0, score2: 3, winner: "Smashers" }
      ],
      final: { team1: "Paddlers", team2: "Smashers", score1: 3, score2: 1, winner: "Paddlers" },
      champion: "Paddlers",
    },
    {
      sport: "Chess",
      qf:[
        { team1: "Kings", team2: "Queens", score1: 4, score2: 0, winner: "Kings" },
        { team1: "Bishops", team2: "Knights", score1: 2, score2: 2, winner: "Bishops" },
        { team1: "Rooks", team2: "Pawns", score1: 3, score2: 1, winner: "Rooks" },
        { team1: "Castles", team2: "Gambits", score1: 1, score2: 3, winner: "Gambits" }
      ],
      sf:[
        { team1: "Kings", team2: "Bishops", score1: 3, score2: 1, winner: "Kings" },
        { team1: "Rooks", team2: "Gambits", score1: 2, score2: 2, winner: "Rooks" }
      ],
      final: { team1: "Kings", team2: "Rooks", score1: 3, score2: 1, winner: "Kings" },
      champion: "Kings",
    },
    {
      sport: "Athletics",
      qf:[
        { team1: "Sprinters", team2: "Jumpers", score1: 10, score2: 8, winner: "Sprinters" },
        { team1: "Throwers", team2: "Hurdlers", score1: 5, score2: 12, winner: "Hurdlers" },
        { team1: "Runners", team2: "Walkers", score1: 15, score2: 3, winner: "Runners" },
        { team1: "Racers", team2: "Dashers", score1: 9, score2: 11, winner: "Dashers" }
      ],
      sf:[
        { team1: "Sprinters", team2: "Hurdlers", score1: 14, score2: 10, winner: "Sprinters" },
        { team1: "Runners", team2: "Dashers", score1: 12, score2: 13, winner: "Dashers" }
      ],
      final: { team1: "Sprinters", team2: "Dashers", score1: 16, score2: 14, winner: "Sprinters" },
      champion: "Sprinters",
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
