import { Match, MatchStatus } from './match.entity';
import { MatchRepository } from './match.repository.interface';
import { StandingService } from '../standings/standing.service';
import { TournamentRepository } from '../tournaments/tournament.repository.interface';
import { TournamentService } from '../tournaments/tournament.service';

export class MatchService {

  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly standingService: StandingService,
    private readonly tournamentRepository: TournamentRepository,
    private readonly tournamentService: TournamentService
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
    const tournament = await this.tournamentRepository.getTournamentById(data.tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    if (tournament.status === 'finished') {
      throw new Error('Matches cannot be added to a finalized tournament');
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
      await this.startTournamentForResult(createdMatch.tournamentId);
    }
    if (createdMatch.status === MatchStatus.Finished) {
      await this.standingService.recalculateStandings(createdMatch.tournamentId);
      await this.finalizeTournamentIfAllMatchesAreFinished(createdMatch.tournamentId);
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
    const tournament = await this.tournamentRepository.getTournamentById(existingMatch.tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    if (tournament.status === 'finished') {
      throw new Error('Matches in finalized tournaments cannot be modified');
    }

    const updatedMatchData = { ...existingMatch, ...match };
    this.validateFinishedMatch(updatedMatchData);

    const updatedMatch = await this.matchRepository.updateMatch(id, match);
    if (!updatedMatch) {
      return null;
    }
    if (updatedMatch.status === MatchStatus.Finished) {
      await this.startTournamentForResult(updatedMatch.tournamentId);
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

    if (updatedMatch.status === MatchStatus.Finished) {
      await this.finalizeTournamentIfAllMatchesAreFinished(updatedMatch.tournamentId);
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

  private async startTournamentForResult(tournamentId: string): Promise<void> {
    const tournament = await this.tournamentRepository.getTournamentById(tournamentId);
    if (!tournament) throw new Error('Tournament not found');
    if (tournament.status === 'pending') {
      const started = await this.tournamentRepository.transitionTournamentStatus(
        tournamentId,
        'pending',
        'in_progress'
      );
      if (!started) {
        const latest = await this.tournamentRepository.getTournamentById(tournamentId);
        if (latest?.status !== 'in_progress') {
          throw new Error('Could not update tournament status after recording the result');
        }
      }
    } else if (tournament.status !== 'in_progress') {
      throw new Error('A result cannot be recorded for a finalized tournament');
    }
  }

  private async finalizeTournamentIfAllMatchesAreFinished(tournamentId: string): Promise<void> {
    const matches = await this.matchRepository.getMatchesByTournamentId(tournamentId);
    if (
      matches.length === 0 ||
      matches.some(match => match.status !== MatchStatus.Finished)
    ) {
      return;
    }

    try {
      await this.tournamentService.finishTournament(tournamentId);
    } catch (error) {
      const tournament = await this.tournamentRepository.getTournamentById(tournamentId);
      if (tournament?.status === 'finished') return;
      throw error;
    }
  }

}