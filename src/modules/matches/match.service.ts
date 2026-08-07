import { Match } from './match.entity';
import { MatchRepository } from './match.repository.interface';

export class MatchService {

  constructor(
    private readonly matchRepository: MatchRepository
  ) {}

  async getMatches(): Promise<Match[]> {
    return await this.matchRepository.getMatches();
  }

  async getMatchById(id: string): Promise<Match | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    return await this.matchRepository.getMatchById(id);
  }

  async getMatchesByTournamentId(tournamentId: string): Promise<Match[]> { 
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }

    return await this.matchRepository.getMatchesByTournamentId(tournamentId);
  }

  async createMatch(data: Omit<Match, 'id'>): Promise<Match> {

    if (!data.tournamentId || data.tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }

    if (!data.homeTeamId || data.homeTeamId.trim().length === 0) {
      throw new Error('Home team ID is required');
    }

    if (!data.awayTeamId || data.awayTeamId.trim().length === 0) {
      throw new Error('Away team ID is required');
    }

    if (data.homeTeamId === data.awayTeamId) {
      throw new Error('A team cannot play against itself');
    }

    if (data.round < 1) {
      throw new Error('Round must be greater than zero');
    }

    return await this.matchRepository.createMatch(data);
  }

  async updateMatch(
    id: string,
    match: Partial<Omit<Match, 'id'>>
  ): Promise<Match | null> {

    if (!id || id.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    return await this.matchRepository.updateMatch(id, match);
  }

  async deleteMatch(id: string): Promise<boolean> {

    if (!id || id.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    return await this.matchRepository.deleteMatch(id);
  }

}