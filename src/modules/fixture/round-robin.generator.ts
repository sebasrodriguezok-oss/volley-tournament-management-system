export interface GeneratedMatch {
  homeTeamId: string;
  awayTeamId: string;
}

export interface GeneratedRound {
  round: number;
  matches: GeneratedMatch[];
}

const FREE_TEAM = "FREE";

export class RoundRobinGenerator {

   generate(teamIds: string[]): GeneratedRound[] {

      // Copy the team IDs to avoid modifying the original array
      const teams = [...teamIds];

      // Add a free slot if the number of teams is odd
      if (teams.length % 2 !== 0) {
        teams.push(FREE_TEAM); 
      }

      // Calculate the number of rounds
      const totalRounds = teams.length - 1;

      // Store all generated rounds
      const generatedRounds: GeneratedRound[] = [];

      // Generate each round
      for (let round = 0; round < totalRounds; round++) {

        const matches: GeneratedMatch[] = [];

        for (let i = 0; i < teams.length / 2; i++) {
          const homeTeamId = teams[i]; // First team comes from the beginning of the array
          const awayTeamId = teams[teams.length - 1 - i]; // Second team comes from the end of the array

          // TODO - Generate the matches for this round
          // Only add the match if neither team is the free slot
          if (homeTeamId !== FREE_TEAM && awayTeamId !== FREE_TEAM) {
            matches.push({ homeTeamId: homeTeamId, awayTeamId: awayTeamId });
          }
        }

        generatedRounds.push({ round: round + 1, matches });

        // TODO - Rotate teams
        // Keep the first team in place and rotate the rest
        const lastTeam = teams.pop();
        if (lastTeam) {
          teams.splice(1, 0, lastTeam);
        }

      }
      
    return generatedRounds;
    }

}