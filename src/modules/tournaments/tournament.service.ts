// DESPUÉS
import { Tournament } from './tournament.entity';
import { TournamentRepository } from './tournament.repository.interface';

export class TournamentService {

  constructor(private readonly tournamentRepository: TournamentRepository) {}

  async getTournaments(): Promise<Tournament[]> {
    return await this.tournamentRepository.getTournaments();
  }

  async getTournamentById(id: string): Promise<Tournament | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }

    const tournament = await this.tournamentRepository.getTournamentById(id);

    if (!tournament) return null;

    return tournament;
  }

  async createTournament(tournamentData: Omit<Tournament, 'id'>): Promise<Tournament> {
    this.validateTournamentData(tournamentData);
    return await this.tournamentRepository.createTournament(tournamentData);
  }

  async updateTournament(id: string, tournamentData: Partial<Omit<Tournament, 'id'>>): Promise<Tournament | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }

    if (Object.keys(tournamentData).length === 0) {
      throw new Error('No data provided for update');
    }

    if (tournamentData.startDate && tournamentData.endDate) {
      this.validateDates(tournamentData.startDate, tournamentData.endDate);
    }

    if (tournamentData.teamCount !== undefined) {
      this.validateTeamCount(tournamentData.teamCount);
    }

    return await this.tournamentRepository.updateTournament(id, tournamentData);
  }

  async deleteTournament(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }

    return await this.tournamentRepository.deleteTournament(id);
  }

  private validateTournamentData(data: Omit<Tournament, 'id'>): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Tournament name is required');
    }

    if (data.name.length > 100) {
      throw new Error('Tournament name must not exceed 100 characters');
    }

    const validTypes = ['round_robin', 'group_stage'];
    if (!validTypes.includes(data.type)) {
      throw new Error('Tournament type must be round_robin or group_stage');
    }

    this.validateDates(data.startDate, data.endDate);
    this.validateTeamCount(data.teamCount);
  }

  private validateDates(startDate: Date, endDate: Date): void {
    if (new Date(endDate) <= new Date(startDate)) {
      throw new Error('End date must be after start date');
    }
  }

  private validateTeamCount(count: number): void {
    if (count < 2) {
      throw new Error('Tournament must have at least 2 teams');
    }
  }
}