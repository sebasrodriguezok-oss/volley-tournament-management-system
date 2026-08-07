import { Request, Response } from 'express';
import { StandingService } from './standing.service';

export class StandingController {

  constructor(private readonly standingService: StandingService) {}

  public async getStandingsByTournament(
    req: Request<{ tournamentId: string }>,
    res: Response
  ): Promise<void> {
    try {
      const standings = await this.standingService.getStandingsByTournamentId(
        req.params.tournamentId
      );
      res.json(standings);
    } catch (error: any) {
      console.error('Error fetching standings:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async updateStandingsAfterMatch(
    req: Request<{ tournamentId: string; matchId: string }>,
    res: Response
  ): Promise<void> {
    try {
      await this.standingService.updateStandingsAfterMatch(
        req.params.tournamentId,
        req.params.matchId
      );
      res.json({ message: 'Standings updated successfully' });
    } catch (error: any) {
      console.error('Error updating standings:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async recalculateStandings(
    req: Request<{ tournamentId: string }>,
    res: Response
  ): Promise<void> {
    try {
      await this.standingService.recalculateStandings(req.params.tournamentId);
      res.json({ message: 'Standings recalculated successfully' });
    } catch (error: any) {
      console.error('Error recalculating standings:', error);
      res.status(400).json({ error: error.message });
    }
  }
}