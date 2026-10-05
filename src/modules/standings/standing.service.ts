import { Standing } from './standing.entity';
import { StandingRepository } from './standing.repository.interface';
import { MatchRepository } from '../matches/match.repository.interface';
import { EnrollmentRepository } from '../enrollments/enrollment.repository.interface';
import { MatchStatus } from '../matches/match.entity';

export class StandingService {

  constructor(
    private readonly standingRepository: StandingRepository,
    private readonly matchRepository: MatchRepository,
    private readonly enrollmentRepository: EnrollmentRepository
  ) {}

  async getStandingsByTournamentId(tournamentId: string): Promise<Standing[]> {
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }

    return await this.standingRepository.getStandingsByTournamentId(tournamentId);
  }

  validateMatchResult(homeScore: number | null, awayScore: number | null): void {
    if (homeScore === null || awayScore === null) {
      throw new Error('Finished match scores are required');
    }

    this.calculatePoints(homeScore, awayScore);
  }

  // Actualiza la tabla de forma incremental para un partido finalizado.
  async updateStandingsAfterMatch(tournamentId: string, matchId: string): Promise<void> {

    // Obtener el partido con el resultado cargado
    const match = await this.matchRepository.getMatchById(matchId);

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.status !== MatchStatus.Finished) {
      throw new Error('Match is not finished yet');
    }

    if (match.homeScore === null || match.awayScore === null) {
      throw new Error('Match scores are not set');
    }

    // Calcular puntos según el resultado
    const { homePoints, awayPoints } = this.calculatePoints(
      match.homeScore,
      match.awayScore
    );

    // Actualizar standing del equipo local
    await this.updateTeamStanding(
      match.homeTeamId,
      tournamentId,
      match.homeScore,    // sets ganados
      match.awayScore,    // sets perdidos
      homePoints
    );

    // Actualizar standing del equipo visitante
    await this.updateTeamStanding(
      match.awayTeamId,
      tournamentId,
      match.awayScore,    // sets ganados
      match.homeScore,    // sets perdidos
      awayPoints
    );
  }

  // Calcula los puntos según el sistema de voley
  private calculatePoints(homeScore: number, awayScore: number): {
    homePoints: number;
    awayPoints: number;
  } {
    if (homeScore === 2 && awayScore === 0) {
      // Victoria 2-0 → 3 puntos ganador, 0 perdedor
      return { homePoints: 3, awayPoints: 0 };
    }

    if (homeScore === 2 && awayScore === 1) {
      // Victoria 2-1 → 2 puntos ganador, 1 perdedor
      return { homePoints: 2, awayPoints: 1 };
    }

    if (homeScore === 1 && awayScore === 2) {
      // Derrota 1-2 → 1 punto perdedor, 2 ganador
      return { homePoints: 1, awayPoints: 2 };
    }

    if (homeScore === 0 && awayScore === 2) {
      // Derrota 0-2 → 0 puntos perdedor, 3 ganador
      return { homePoints: 0, awayPoints: 3 };
    }

    throw new Error(`Invalid score: ${homeScore}-${awayScore}. Valid scores are 2-0, 2-1, 1-2, 0-2`);
  }

  private async updateTeamStanding(
    teamId: string,
    tournamentId: string,
    setsWon: number,
    setsLost: number,
    points: number
  ): Promise<void> {

    const isWin = points >= 2;

    // Buscar si ya existe un standing para este equipo en este torneo
    const existing = await this.standingRepository.getStandingByTeamAndTournament(
      teamId,
      tournamentId
    );

    if (existing) {
      // Actualizar standing existente
      await this.standingRepository.updateStanding(existing.id, {
        matchesPlayed: existing.matchesPlayed + 1,
        wins: existing.wins + (isWin ? 1 : 0),
        losses: existing.losses + (isWin ? 0 : 1),
        setsWon: existing.setsWon + setsWon,
        setsLost: existing.setsLost + setsLost,
        points: existing.points + points
      });
    } else {
      // Crear nuevo standing para este equipo
      await this.standingRepository.createStanding({
        tournamentId,
        teamId,
        matchesPlayed: 1,
        wins: isWin ? 1 : 0,
        losses: isWin ? 0 : 1,
        setsWon,
        setsLost,
        points
      });
    }
  }

  // Recalcula toda la tabla desde cero (útil si se corrige un resultado)
  async recalculateStandings(tournamentId: string): Promise<void> {
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }

    // Traer todos los partidos finalizados del torneo
    const matches = await this.matchRepository.getMatchesByTournamentId(tournamentId);
    const finishedMatches = matches.filter(m => m.status === MatchStatus.Finished);

    for (const match of finishedMatches) {
      this.validateMatchResult(match.homeScore, match.awayScore);
    }

    await this.standingRepository.deleteStandingsByTournamentId(tournamentId);

    // Recalcular cada partido
    for (const match of finishedMatches) {
      await this.updateStandingsAfterMatch(tournamentId, match.id);
    }
  }
}