import { Router } from 'express';
import { TournamentController } from './tournament.controller';

export class TournamentRoutes {

  public readonly router = Router();

  constructor(private readonly tournamentController: TournamentController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/tournaments', this.tournamentController.getTournaments.bind(this.tournamentController));
    this.router.get('/tournaments/:id', this.tournamentController.getTournament.bind(this.tournamentController));
    this.router.post('/tournaments', this.tournamentController.createTournament.bind(this.tournamentController));
    this.router.put('/tournaments/:id', this.tournamentController.updateTournament.bind(this.tournamentController));
    this.router.delete('/tournaments/:id', this.tournamentController.deleteTournament.bind(this.tournamentController));
  }
}