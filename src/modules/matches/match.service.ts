import { Match, MatchStatus } from './match.entity';
import { MatchRepository } from './match.repository.interface';
import { StandingService } from '../standings/standing.service';

export class MatchService {

  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly standingService: StandingService
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

    this.validateFinishedMatch(data);

    const createdMatch = await this.matchRepository.createMatch(data);
    if (createdMatch.status === MatchStatus.Finished) {
      await this.standingService.recalculateStandings(createdMatch.tournamentId);
    }

    return createdMatch;
  }

  async updateMatch(
    id: string,
    match: Partial<Omit<Match, 'id'>>
  ): Promise<Match | null> {

    if (!id || id.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    const existingMatch = await this.matchRepository.getMatchById(id);
    if (!existingMatch) {
      return null;
    }

    const updatedMatchData = { ...existingMatch, ...match };
    this.validateFinishedMatch(updatedMatchData);

    const updatedMatch = await this.matchRepository.updateMatch(id, match);
    if (!updatedMatch) {
      return null;
    }

    const tournamentsToRecalculate = new Set<string>();
    if (existingMatch.status === MatchStatus.Finished) {
      tournamentsToRecalculate.add(existingMatch.tournamentId);
    }
    if (updatedMatch.status === MatchStatus.Finished) {
      tournamentsToRecalculate.add(updatedMatch.tournamentId);
    }

    for (const tournamentId of tournamentsToRecalculate) {
      await this.standingService.recalculateStandings(tournamentId);
    }

    return updatedMatch;
  }

  async deleteMatch(id: string): Promise<boolean> {

    if (!id || id.trim().length === 0) {
      throw new Error('Match ID is required');
    }

    const existingMatch = await this.matchRepository.getMatchById(id);
    if (!existingMatch) {
      return false;
    }

    const deleted = await this.matchRepository.deleteMatch(id);
    if (deleted && existingMatch.status === MatchStatus.Finished) {
      await this.standingService.recalculateStandings(existingMatch.tournamentId);
    }

    return deleted;
  }

  private validateFinishedMatch(match: Omit<Match, 'id'> | Match): void {
    if (match.status === MatchStatus.Finished) {
      this.standingService.validateMatchResult(match.homeScore, match.awayScore);
    }
  }

}