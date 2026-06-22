import { Request, Response } from 'express';
import { EquipoService } from './equipo.service';

export class EquipoController {

  constructor(private readonly equipoService: EquipoService) {}

  public async getEquipos(_req: Request, res: Response): Promise<void> {
    try {
      const equipos = await this.equipoService.getEquipos();
      res.json(equipos);
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  public async getEquipo(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const equipo = await this.equipoService.getEquipoById(req.params.id);

      if (equipo) {
        res.json(equipo);
      } else {
        res.status(404).json({ error: 'Equipo no encontrado' });
      }
    } catch (error: any) {
      console.error('Error al obtener equipo:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async createEquipo(req: Request, res: Response): Promise<void> {
    try {
      const equipo = await this.equipoService.createEquipo(req.body);
      res.status(201).json(equipo);
    } catch (error: any) {
      console.error('Error al crear equipo:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async updateEquipo(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const equipo = await this.equipoService.updateEquipo(req.params.id, req.body);

      if (equipo) {
        res.json(equipo);
      } else {
        res.status(404).json({ error: 'Equipo no encontrado' });
      }
    } catch (error: any) {
      console.error('Error al actualizar equipo:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async deleteEquipo(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const deleted = await this.equipoService.deleteEquipo(req.params.id);

      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Equipo no encontrado' });
      }
    } catch (error: any) {
      console.error('Error al eliminar equipo:', error);
      res.status(400).json({ error: error.message });
    }
  }
}