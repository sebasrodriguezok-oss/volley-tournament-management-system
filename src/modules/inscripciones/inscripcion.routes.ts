import { Router } from 'express';
import { InscripcionController } from './inscripcion.controller';

export class InscripcionRoutes {

  public readonly router = Router();

  constructor(private readonly inscripcionController: InscripcionController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/inscripciones', this.inscripcionController.getInscripciones.bind(this.inscripcionController));
    this.router.get('/inscripciones/torneo/:torneoId', this.inscripcionController.getInscripcionesByTorneo.bind(this.inscripcionController));
    this.router.get('/inscripciones/equipo/:equipoId', this.inscripcionController.getInscripcionesByEquipo.bind(this.inscripcionController));
    this.router.get('/inscripciones/:id', this.inscripcionController.getInscripcion.bind(this.inscripcionController));
    this.router.post('/inscripciones', this.inscripcionController.createInscripcion.bind(this.inscripcionController));
    this.router.delete('/inscripciones/:id', this.inscripcionController.deleteInscripcion.bind(this.inscripcionController));
  }
}