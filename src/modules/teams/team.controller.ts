import { Request, Response } from 'express';
import { TeamService } from './team.service';

export class TeamController {

  constructor(private readonly teamService: TeamService) {}

  public async getTeams(_req: Request, res: Response): Promise<void> {
    try {
      const teams = await this.teamService.getTeams();
      res.json(teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  public async getTeam(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const team = await this.teamService.getTeamById(req.params.id);

      if (team) {
        res.json(team);
      } else {
        res.status(404).json({ error: 'Team not found' });
      }
    } catch (error: any) {
      console.error('Error fetching team:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async createTeam(req: Request, res: Response): Promise<void> {
    try {
      const team = await this.teamService.createTeam(req.body);
      res.status(201).json(team);
    } catch (error: any) {
      console.error('Error creating team:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async updateTeam(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const team = await this.teamService.updateTeam(req.params.id, req.body);

      if (team) {
        res.json(team);
      } else {
        res.status(404).json({ error: 'Team not found' });
      }
    } catch (error: any) {
      console.error('Error updating team:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async deleteTeam(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const deleted = await this.teamService.deleteTeam(req.params.id);

      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Team not found' });
      }
    } catch (error: any) {
      console.error('Error deleting team:', error);
      res.status(400).json({ error: error.message });
    }
  }
}