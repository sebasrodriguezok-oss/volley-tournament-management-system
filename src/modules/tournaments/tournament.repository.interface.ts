import { Tournament } from './tournament.entity';

export interface TournamentRepository {
  getTournaments(): Promise<Tournament[]>;
  getTournamentById(id: string): Promise<Tournament | null>;
  createTournament(tournament: Omit<Tournament, 'id'>): Promise<Tournament>;
  updateTournament(id: string, tournament: Partial<Omit<Tournament, 'id'>>): Promise<Tournament | null>;
  transitionTournamentStatus(
    id: string,
    currentStatus: Tournament['status'],
    nextStatus: Tournament['status']
  ): Promise<Tournament | null>;
  deleteTournament(id: string): Promise<boolean>;
}