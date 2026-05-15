export interface Team {
  team_id: number;
  team_name: string;
  sport: string;
  coach_name: string;
  logo?: string;
}

export interface Player {
  player_id: number;
  player_name: string;
  team_id: number;
  sport: string;
  jersey_number: number;
}

export interface Match {
  match_id: number;
  sport: string;
  team1_id: number;
  team2_id: number;
  match_date: string;
  score_team1: number;
  score_team2: number;
  winner: string | null;
  status: "completed" | "live" | "upcoming";
  game_label: string;
  venue?: string;
  referee?: string;
  current_period?: string;
  remaining_time?: string;
  clock_status?: "running" | "paused";
  last_clock_update?: number;
  remaining_seconds?: number;
  recent_action?: {
    player_name: string;
    action: string;
    team_id: number;
    timestamp: string;
  };
  timeouts_team1?: number;
  timeouts_team2?: number;
  scheduled_start_time?: string;
}

export interface PlayerStat {
  stat_id: number;
  player_id: number;
  match_id: number;
  sport: string;
  points?: number;
  rebounds?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  kills?: number;
  digs?: number;
  aces?: number;
  smashes?: number;
  drops?: number;
  clears?: number;
  kicks?: number;
  headers?: number;
  rolls?: number;
  strikes?: number;
  disarms?: number;
  punches?: number;
  knockdowns?: number;
  service_wins?: number;
  fouls?: number;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  password?: string;
  role: "ADMIN" | "TABULATOR";
}

export interface FinalsGame {
  sport: string;
  game: string;
  winner: string;
  scoreA: number;
  scoreB: number;
  loser: string;
}

export interface BracketMatch {
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  winner?: string;
}

export interface Bracket {
  sport: string;
  qf: BracketMatch[];
  sf: BracketMatch[];
  final: BracketMatch;
  champion: string;
}

export interface ActivityLog {
  id: number;
  message: string;
  timestamp: string;
}

export interface Referee {
  referee_id: number;
  name: string;
  sport: string;
  contact?: string;
}

export interface Database {
  sports: string[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  playerStats: PlayerStat[];
  users: User[];
  finalsGames: FinalsGame[];
  brackets: Bracket[];
  activityLogs: ActivityLog[];
  referees: Referee[];
}
