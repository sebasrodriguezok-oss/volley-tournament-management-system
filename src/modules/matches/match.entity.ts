export enum MatchStatus {
  Scheduled = 'scheduled',
  InProgress = 'in_progress',
  Finished = 'finished'
}

export interface Match {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  round: number;
  matchDate: Date | null;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
}