import { Router } from 'express';
import { TeamController } from './team.controller';

export class TeamRoutes {

  public readonly router = Router();

  constructor(private readonly teamController: TeamController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/teams', this.teamController.getTeams.bind(this.teamController));
    this.router.get('/teams/:id', this.teamController.getTeam.bind(this.teamController));
    this.router.post('/teams', this.teamController.createTeam.bind(this.teamController));
    this.router.put('/teams/:id', this.teamController.updateTeam.bind(this.teamController));
    this.router.delete('/teams/:id', this.teamController.deleteTeam.bind(this.teamController));
  }
}