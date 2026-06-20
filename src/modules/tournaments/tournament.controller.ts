// DESPUÉS
import { Request, Response } from 'express';
import { TournamentService } from './tournament.service';

export class TournamentController {

  constructor(private readonly tournamentService: TournamentService) {}

  public async getTournaments(_req: Request, res: Response): Promise<void> {
    try {
      const tournaments = await this.tournamentService.getTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  public async getTournament(req: Request<{ id: string }>, res: Response): Promise<void> {
    const id = req.params.id;

    if (!id || id.trim().length === 0) {
      res.status(400).json({ error: 'Invalid tournament ID' });
      return;
    }

    try {
      const tournament = await this.tournamentService.getTournamentById(id);

      if (tournament) {
        res.json(tournament);
      } else {
        res.status(404).json({ error: 'Tournament not found' });
      }
    } catch (error: any) {
      console.error('Error fetching tournament:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async createTournament(req: Request, res: Response): Promise<void> {
    try {
      const tournament = await this.tournamentService.createTournament(req.body);
      res.status(201).json(tournament);
    } catch (error: any) {
      console.error('Error creating tournament:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async updateTournament(req: Request<{ id: string }>, res: Response): Promise<void> {
    const id = req.params.id;

    if (!id || id.trim().length === 0) {
      res.status(400).json({ error: 'Invalid tournament ID' });
      return;
    }

    try {
      const tournament = await this.tournamentService.updateTournament(id, req.body);

      if (tournament) {
        res.json(tournament);
      } else {
        res.status(404).json({ error: 'Tournament not found' });
      }
    } catch (error: any) {
      console.error('Error updating tournament:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async deleteTournament(req: Request<{ id: string }>, res: Response): Promise<void> {
    const id = req.params.id;

    if (!id || id.trim().length === 0) {
      res.status(400).json({ error: 'Invalid tournament ID' });
      return;
    }

    try {
      const deleted = await this.tournamentService.deleteTournament(id);

      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Tournament not found' });
      }
    } catch (error: any) {
      console.error('Error deleting tournament:', error);
      res.status(400).json({ error: error.message });
    }
  }
}