import { Standing } from './standing.entity';

export interface StandingRepository {
  getStandingsByTournamentId(tournamentId: string): Promise<Standing[]>;
  getStandingByTeamAndTournament(teamId: string, tournamentId: string): Promise<Standing | null>;
  createStanding(standing: Omit<Standing, 'id'>): Promise<Standing>;
  updateStanding(id: string, standing: Partial<Omit<Standing, 'id'>>): Promise<Standing | null>;
  deleteStandingsByTournamentId(tournamentId: string): Promise<boolean>;
}   