import { Torneo } from './torneo.entity';
import { TorneoRepository } from './torneo.repository.interface';

export class TorneoService {

  constructor(private readonly torneoRepository: TorneoRepository) {}

  async getTorneos(): Promise<Torneo[]> {
    return await this.torneoRepository.getTorneos();
  }

  async getTorneoById(id: string): Promise<Torneo | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('El ID del torneo es requerido');
    }

    const torneo = await this.torneoRepository.getTorneoById(id);

    if (!torneo) return null;

    return torneo;
  }

  async createTorneo(torneoData: Omit<Torneo, 'id'>): Promise<Torneo> {
    this.validateTorneoData(torneoData);
    return await this.torneoRepository.createTorneo(torneoData);
  }

  async updateTorneo(id: string, torneoData: Partial<Omit<Torneo, 'id'>>): Promise<Torneo | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('El ID del torneo es requerido');
    }

    if (Object.keys(torneoData).length === 0) {
      throw new Error('No se enviaron datos para actualizar');
    }

    if (torneoData.fechaInicio && torneoData.fechaFin) {
      this.validateFechas(torneoData.fechaInicio, torneoData.fechaFin);
    }

    if (torneoData.cantidadEquipos !== undefined) {
      this.validateCantidadEquipos(torneoData.cantidadEquipos);
    }

    return await this.torneoRepository.updateTorneo(id, torneoData);
  }

  async deleteTorneo(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('El ID del torneo es requerido');
    }

    return await this.torneoRepository.deleteTorneo(id);
  }

  private validateTorneoData(data: Omit<Torneo, 'id'>): void {
    if (!data.nombre || data.nombre.trim().length === 0) {
      throw new Error('El nombre del torneo es requerido');
    }

    if (data.nombre.length > 100) {
      throw new Error('El nombre no puede superar los 100 caracteres');
    }

    const tiposValidos = ['todos_contra_todos', 'por_zonas'];
    if (!tiposValidos.includes(data.tipo)) {
      throw new Error('El tipo de torneo debe ser todos_contra_todos o por_zonas');
    }

    this.validateFechas(data.fechaInicio, data.fechaFin);
    this.validateCantidadEquipos(data.cantidadEquipos);
  }

  private validateFechas(fechaInicio: Date, fechaFin: Date): void {
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
  }

  private validateCantidadEquipos(cantidad: number): void {
    if (cantidad < 2) {
      throw new Error('Debe haber al menos 2 equipos');
    }
  }
}