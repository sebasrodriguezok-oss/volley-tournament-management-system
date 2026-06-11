import { Request, Response } from 'express';
import { TorneoService } from './torneo.service';

export class TorneoController {

  constructor(private readonly torneoService: TorneoService) {}

  public async getTorneos(_req: Request, res: Response): Promise<void> {
    try {
      const torneos = await this.torneoService.getTorneos();
      res.json(torneos);
    } catch (error) {
      console.error('Error al obtener torneos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  public async getTorneo(req: Request<{ id: string }>, res: Response): Promise<void> {
    const id = req.params.id;

    if (!id || id.trim().length === 0) {
      res.status(400).json({ error: 'ID de torneo inválido' });
      return;
    }

    try {
      const torneo = await this.torneoService.getTorneoById(id);

      if (torneo) {
        res.json(torneo);
      } else {
        res.status(404).json({ error: 'Torneo no encontrado' });
      }
    } catch (error: any) {
      console.error('Error al obtener torneo:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async createTorneo(req: Request, res: Response): Promise<void> {
    try {
      const torneo = await this.torneoService.createTorneo(req.body);
      res.status(201).json(torneo);
    } catch (error: any) {
      console.error('Error al crear torneo:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async updateTorneo(req: Request<{ id: string }>, res: Response): Promise<void> {
    const id = req.params.id;

    if (!id || id.trim().length === 0) {
      res.status(400).json({ error: 'ID de torneo inválido' });
      return;
    }

    try {
      const torneo = await this.torneoService.updateTorneo(id, req.body);

      if (torneo) {
        res.json(torneo);
      } else {
        res.status(404).json({ error: 'Torneo no encontrado' });
      }
    } catch (error: any) {
      console.error('Error al actualizar torneo:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async deleteTorneo(req: Request<{ id: string }>, res: Response): Promise<void> {
    const id = req.params.id;

    if (!id || id.trim().length === 0) {
      res.status(400).json({ error: 'ID de torneo inválido' });
      return;
    }

    try {
      const deleted = await this.torneoService.deleteTorneo(id);

      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Torneo no encontrado' });
      }
    } catch (error: any) {
      console.error('Error al eliminar torneo:', error);
      res.status(400).json({ error: error.message });
    }
  }
}