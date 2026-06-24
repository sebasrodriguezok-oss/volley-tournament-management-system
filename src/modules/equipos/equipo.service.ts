import { Equipo } from './equipo.entity';
import { EquipoRepository } from './equipo.repository.interface';

export class EquipoService {

  constructor(
    private readonly equipoRepository: EquipoRepository
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
    return await this.equipoRepository.createEquipo(equipoData);
  }

  async updateEquipo(id: string, equipoData: Partial<Omit<Equipo, 'id'>>): Promise<Equipo | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('El ID del equipo es requerido');
    }

    if (Object.keys(equipoData).length === 0) {
      throw new Error('No se enviaron datos para actualizar');
    }

    if (equipoData.nombre !== undefined) {
      if (!equipoData.nombre || equipoData.nombre.trim().length === 0) {
        throw new Error('El nombre del equipo es requerido');
      }

      if (equipoData.nombre.length > 100) {
        throw new Error('El nombre del equipo no puede superar los 100 caracteres');
      }
    }

    if (equipoData.categoria !== undefined && (!equipoData.categoria || equipoData.categoria.trim().length === 0)) {
      throw new Error('La categoría del equipo es requerida');
    }

    if (equipoData.cantidadJugadores !== undefined && equipoData.cantidadJugadores < 1) {
      throw new Error('El equipo debe tener al menos un jugador');
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

    return await this.equipoRepository.deleteEquipo(id);
  }

  private validateEquipoData(data: Omit<Equipo, 'id'>): void {
    if (!data.nombre || data.nombre.trim().length === 0) {
      throw new Error('El nombre del equipo es requerido');
    }

    if (data.nombre.length > 100) {
      throw new Error('El nombre del equipo no puede superar los 100 caracteres');
    }

    if (!data.categoria || data.categoria.trim().length === 0) {
      throw new Error('La categoría del equipo es requerida');
    }

    if (data.cantidadJugadores < 1) {
      throw new Error('El equipo debe tener al menos un jugador');
    }
  }
}