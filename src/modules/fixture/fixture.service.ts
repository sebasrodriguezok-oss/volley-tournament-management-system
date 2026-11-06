import { TournamentRepository } from "../tournaments/tournament.repository.interface";
import { EnrollmentRepository } from "../enrollments/enrollment.repository.interface";
import { MatchRepository } from "../matches/match.repository.interface";
import { RoundRobinGenerator } from "./round-robin.generator";
import { Match, MatchStatus } from "../matches/match.entity";
import { TeamRepository } from "../teams/team.repository.interface";

export interface FixtureGenerationResult {
  message: string;
  rounds: number;
  matches: number;
}

export class FixtureService {

  constructor(
    private readonly tournamentRepository: TournamentRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly matchRepository: MatchRepository,
    private readonly teamRepository: TeamRepository,
    private readonly roundRobinGenerator: RoundRobinGenerator
  ) {}

  async generateFixture(
    tournamentId: string
  ): Promise<FixtureGenerationResult> {

    // TODO 0 - Validate the tournamentId parameter
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error("Tournament ID is required");
    }

    // TODO 1 - Fetch the tournament by ID and verify that it exists
    const tournament = await this.tournamentRepository.getTournamentById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // TODO 2 - Verify that the tournament is in a "pending" state.
    if (tournament.status !== "pending") {
      throw new Error("Fixture can only be generated for pending tournaments");
    }
    if (tournament.type !== "round_robin") {
      throw new Error("Only Round Robin tournaments can generate a fixture");
    }

    // TODO 3 - Verify that the fixture has not already been generated for this tournament
    const existingMatches =
      await this.matchRepository.getMatchesByTournamentId(tournamentId);

    if (existingMatches.length > 0) {
      throw new Error("Fixture has already been generated");
    }

    // TODO 4 - Fetch enrollments for the tournament
    const enrollments = await this.enrollmentRepository.getEnrollmentsByTournamentId(tournamentId);

    if (enrollments.length < 2) {
      throw new Error(
        "At least two enrolled teams are required to generate a fixture");
    }
    if (enrollments.length !== tournament.teamCount) {
      throw new Error("The number of enrolled teams must exactly match the tournament team count");
    }

    const teamIds = enrollments.map(enrollment => enrollment.teamId);
    if (new Set(teamIds).size !== teamIds.length) {
      throw new Error("A team cannot be enrolled more than once in the same tournament");
    }

    const teams = await Promise.all(teamIds.map(teamId => this.teamRepository.getTeamById(teamId)));
    if (teams.some(team => !team)) {
      throw new Error("Every enrolled team must exist before generating the fixture");
    }
    if (teams.some(team => team!.category !== tournament.category)) {
      throw new Error("All enrolled teams must match the tournament category");
    }

    const generatedRounds =
      this.roundRobinGenerator.generate(teamIds);
    const expectedMatches = (teamIds.length * (teamIds.length - 1)) / 2;
    const fixture: Omit<Match, "id">[] = [];

    for (const generatedRound of generatedRounds) {
      for (const generatedMatch of generatedRound.matches) {
        fixture.push({
          tournamentId,
          homeTeamId: generatedMatch.homeTeamId,
          awayTeamId: generatedMatch.awayTeamId,
          round: generatedRound.round,
          matchDate: null,
          status: MatchStatus.Scheduled,
          homeScore: null,
          awayScore: null
        });
      }
    }

    if (fixture.length !== expectedMatches) {
      throw new Error("Generated fixture does not contain every Round Robin matchup");
    }

    const createdIds: string[] = [];
    try {
      for (const match of fixture) {
        const created = await this.matchRepository.createMatch(match);
        createdIds.push(created.id);
      }
    } catch (error) {
      const cleanupErrors: Error[] = [];
      for (const id of createdIds) {
        try {
          const deleted = await this.matchRepository.deleteMatch(id);
          if (!deleted) cleanupErrors.push(new Error(`Could not remove partially created match ${id}`));
        } catch (cleanupError) {
          cleanupErrors.push(
            cleanupError instanceof Error ? cleanupError : new Error(String(cleanupError))
          );
        }
      }
      const originalMessage = error instanceof Error ? error.message : String(error);
      if (cleanupErrors.length > 0) {
        throw new Error(
          `Fixture creation failed (${originalMessage}) and rollback was incomplete (${cleanupErrors.map(item => item.message).join("; ")})`
        );
      }
      throw error;
    }

    return {
      message: "Fixture generated successfully",
      rounds: generatedRounds.length,
      matches: fixture.length
    };

  }

}
