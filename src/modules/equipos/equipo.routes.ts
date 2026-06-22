import { Router } from 'express';
import { EquipoController } from './equipo.controller';

export class EquipoRoutes {

  public readonly router = Router();

  constructor(private readonly equipoController: EquipoController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/equipos', this.equipoController.getEquipos.bind(this.equipoController));
    this.router.get('/equipos/:id', this.equipoController.getEquipo.bind(this.equipoController));
    this.router.post('/equipos', this.equipoController.createEquipo.bind(this.equipoController));
    this.router.put('/equipos/:id', this.equipoController.updateEquipo.bind(this.equipoController));
    this.router.delete('/equipos/:id', this.equipoController.deleteEquipo.bind(this.equipoController));
  }
}