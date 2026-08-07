import { Match } from './match.entity';

export interface MatchRepository {

  getMatches(): Promise<Match[]>;
  getMatchById(id: string): Promise<Match | null>;
  getMatchesByTournamentId(tournamentId: string): Promise<Match[]>;
  createMatch(match: Omit<Match, 'id'>): Promise<Match>;
  updateMatch(
    id: string,
    match: Partial<Omit<Match, 'id'>>
  ): Promise<Match | null>;
  deleteMatch(id: string): Promise<boolean>;

}