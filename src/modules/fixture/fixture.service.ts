import { TournamentRepository } from "../tournaments/tournament.repository.interface";
import { EnrollmentRepository } from "../enrollments/enrollment.repository.interface";
import { MatchRepository } from "../matches/match.repository.interface";
import { RoundRobinGenerator } from "./round-robin.generator";
import { Match, MatchStatus } from "../matches/match.entity";

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

    // TODO 3 - Verify that the fixture has not already been generated for this tournament
    const existingMatches =
      await this.matchRepository.getMatchesByTournamentId(tournamentId);

    if (existingMatches.length > 0) {
      throw new Error("Fixture has already been generated");
    }

    // TODO 4 - Fetch enrollments for the tournament
    const enrollments = await this.enrollmentRepository.getEnrollmentsByTournamentId(tournamentId);

    // TODO 5 - Verify that there are at least two enrolled teams
    if (enrollments.length < 2) {
      throw new Error(
        "At least two enrolled teams are required to generate a fixture");
    }

    // TODO 6 - Extract the IDs of the enrolled teams, the RoundRobinGenerator only needs the list of team IDs.
    const teamIds = enrollments.map(enrollment => enrollment.teamId);

    // Generate the fixture using the Round Robin algorithm
    const generatedRounds =
      this.roundRobinGenerator.generate(teamIds);
    
    // Counter used to report how many matches were created
    let createdMatches = 0;

    // Iterate through every generated round
    for (const generatedRound of generatedRounds) {

      // Iterate through every match in the current round
      for (const generatedMatch of generatedRound.matches) {
          const match: Omit<Match, "id"> = {
          tournamentId,
          homeTeamId: generatedMatch.homeTeamId,
          awayTeamId: generatedMatch.awayTeamId,
          round: generatedRound.round,
          matchDate: tournament.startDate,
          status: MatchStatus.Scheduled,
          homeScore: null,
          awayScore: null
        };
        //Save generated match into MongoDB
        await this.matchRepository.createMatch(match);
        createdMatches++;
      }
    }

    return {
      message: "Fixture generated successfully",
      rounds: generatedRounds.length,
      matches: createdMatches
    };

  }

}
