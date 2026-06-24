import { Request, Response } from 'express';
import { InscripcionService } from './inscripcion.service';

export class InscripcionController {

  constructor(private readonly inscripcionService: InscripcionService) {}

  public async getInscripciones(_req: Request, res: Response): Promise<void> {
    try {
      const inscripciones = await this.inscripcionService.getInscripciones();
      res.json(inscripciones);
    } catch (error) {
      console.error('Error al obtener inscripciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  public async getInscripcion(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const inscripcion = await this.inscripcionService.getInscripcionById(req.params.id);

      if (inscripcion) {
        res.json(inscripcion);
      } else {
        res.status(404).json({ error: 'Inscripción no encontrada' });
      }
    } catch (error: any) {
      console.error('Error al obtener inscripción:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async getInscripcionesByTorneo(req: Request<{ torneoId: string }>, res: Response): Promise<void> {
    try {
      const inscripciones = await this.inscripcionService.getInscripcionesByTorneoId(req.params.torneoId);
      res.json(inscripciones);
    } catch (error: any) {
      console.error('Error al obtener inscripciones por torneo:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async getInscripcionesByEquipo(req: Request<{ equipoId: string }>, res: Response): Promise<void> {
    try {
      const inscripciones = await this.inscripcionService.getInscripcionesByEquipoId(req.params.equipoId);
      res.json(inscripciones);
    } catch (error: any) {
      console.error('Error al obtener inscripciones por equipo:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async createInscripcion(req: Request, res: Response): Promise<void> {
    try {
      const inscripcion = await this.inscripcionService.createInscripcion(req.body);
      res.status(201).json(inscripcion);
    } catch (error: any) {
      console.error('Error al crear inscripción:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async deleteInscripcion(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const deleted = await this.inscripcionService.deleteInscripcion(req.params.id);

      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Inscripción no encontrada' });
      }
    } catch (error: any) {
      console.error('Error al eliminar inscripción:', error);
      res.status(400).json({ error: error.message });
    }
  }
}