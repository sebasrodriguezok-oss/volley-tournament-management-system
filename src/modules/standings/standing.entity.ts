export interface Standing {
  id: string;
  tournamentId: string;
  teamId: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  points: number;
}