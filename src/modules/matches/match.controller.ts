import { Request, Response } from 'express';
import { MatchService } from './match.service';

export class MatchController {

  constructor(private readonly matchService: MatchService) {}

  public async getMatches(_req: Request, res: Response): Promise<void> {
    try {
      const matches = await this.matchService.getMatches();
      res.json(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  public async getMatch(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const match = await this.matchService.getMatchById(req.params.id);

      if (match) {
        res.json(match);
      } else {
        res.status(404).json({ error: 'Match not found' });
      }
    } catch (error: any) {
      console.error('Error fetching match:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async getMatchesByTournament(
    req: Request<{ tournamentId: string }>,
    res: Response
  ): Promise<void> {
    try {
      const matches = await this.matchService.getMatchesByTournamentId(
        req.params.tournamentId
      );

      res.json(matches);
    } catch (error: any) {
      console.error('Error fetching matches by tournament:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async createMatch(req: Request, res: Response): Promise<void> {
    try {
      const match = await this.matchService.createMatch(req.body);
      res.status(201).json(match);
    } catch (error: any) {
      console.error('Error creating match:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async updateMatch(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const match = await this.matchService.updateMatch(
        req.params.id,
        req.body
      );

      if (match) {
        res.json(match);
      } else {
        res.status(404).json({ error: 'Match not found' });
      }
    } catch (error: any) {
      console.error('Error updating match:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async deleteMatch(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const deleted = await this.matchService.deleteMatch(req.params.id);

      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Match not found' });
      }
    } catch (error: any) {
      console.error('Error deleting match:', error);
      res.status(400).json({ error: error.message });
    }
  }
}