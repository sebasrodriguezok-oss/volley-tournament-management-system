import { Router } from 'express';
import { TorneoController } from './torneo.controller';

export class TorneoRoutes {

  public readonly router = Router();

  constructor(private readonly torneoController: TorneoController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/torneos', this.torneoController.getTorneos.bind(this.torneoController));
    this.router.get('/torneos/:id', this.torneoController.getTorneo.bind(this.torneoController));
    this.router.post('/torneos', this.torneoController.createTorneo.bind(this.torneoController));
    this.router.put('/torneos/:id', this.torneoController.updateTorneo.bind(this.torneoController));
    this.router.delete('/torneos/:id', this.torneoController.deleteTorneo.bind(this.torneoController));
  }
}