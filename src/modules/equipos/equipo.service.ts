import { Equipo } from './equipo.entity';
import { EquipoRepository } from './equipo.repository.interface';
import { TorneoRepository } from '../torneos/torneo.repository.interface';

export class EquipoService {

  constructor(
    private readonly equipoRepository: EquipoRepository,
    private readonly torneoRepository: TorneoRepository
  ) {}

  async getEquipos(): Promise<Equipo[]> {
    return await this.equipoRepository.getEquipos();
  }

  async getEquipoById(id: string): Promise<Equipo | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('El ID del equipo es requerido');
    }

    return await this.equipoRepository.getEquipoById(id);
  }

  async createEquipo(equipoData: Omit<Equipo, 'id'>): Promise<Equipo> {
    this.validateEquipoData(equipoData);

    const torneo = await this.torneoRepository.getTorneoById(equipoData.torneoId);

    if (!torneo) {
      throw new Error('El torneo indicado no existe');
    }

    if (torneo.estado !== 'pendiente') {
      throw new Error('No se pueden agregar equipos luego de iniciado el torneo');
    }

    return await this.equipoRepository.createEquipo(equipoData);
  }

  async updateEquipo(id: string, equipoData: Partial<Omit<Equipo, 'id'>>): Promise<Equipo | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('El ID del equipo es requerido');
    }

    if (Object.keys(equipoData).length === 0) {
      throw new Error('No se enviaron datos para actualizar');
    }

    return await this.equipoRepository.updateEquipo(id, equipoData);
  }

  async deleteEquipo(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('El ID del equipo es requerido');
    }

    const equipo = await this.equipoRepository.getEquipoById(id);

    if (!equipo) {
      return false;
    }

    const torneo = await this.torneoRepository.getTorneoById(equipo.torneoId);

    if (!torneo) {
      throw new Error('El torneo asociado al equipo no existe');
    }

    if (torneo.estado !== 'pendiente') {
      throw new Error('No se pueden eliminar equipos luego de iniciado el torneo');
    }

    // Esta regla queda pendiente hasta que exista el módulo de partidos:
    // "Un equipo solo podrá eliminarse si no tiene partidos jugados".

    return await this.equipoRepository.deleteEquipo(id);
  }

  private validateEquipoData(data: Omit<Equipo, 'id'>): void {
    if (!data.nombre || data.nombre.trim().length === 0) {
      throw new Error('El nombre del equipo es requerido');
    }

    if (data.nombre.length > 100) {
      throw new Error('El nombre del equipo no puede superar los 100 caracteres');
    }

    if (!data.torneoId || data.torneoId.trim().length === 0) {
      throw new Error('El equipo debe pertenecer a un torneo');
    }

    if (!data.categoria || data.categoria.trim().length === 0) {
      throw new Error('La categoría del equipo es requerida');
    }

    if (data.cantidadJugadores < 1) {
      throw new Error('El equipo debe tener al menos un jugador');
    }
  }
}