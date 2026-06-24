import { Inscripcion } from './inscripcion.entity';
import { InscripcionRepository } from './inscripcion.repository.interface';
import { EquipoRepository } from '../equipos/equipo.repository.interface';
import { TorneoRepository } from '../torneos/torneo.repository.interface';

export class InscripcionService {

  constructor(
    private readonly inscripcionRepository: InscripcionRepository,
    private readonly equipoRepository: EquipoRepository,
    private readonly torneoRepository: TorneoRepository
  ) {}

  async getInscripciones(): Promise<Inscripcion[]> {
    return await this.inscripcionRepository.getInscripciones();
  }

  async getInscripcionById(id: string): Promise<Inscripcion | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('El ID de la inscripción es requerido');
    }

    return await this.inscripcionRepository.getInscripcionById(id);
  }

  async getInscripcionesByTorneoId(torneoId: string): Promise<Inscripcion[]> {
    if (!torneoId || torneoId.trim().length === 0) {
      throw new Error('El ID del torneo es requerido');
    }

    return await this.inscripcionRepository.getInscripcionesByTorneoId(torneoId);
  }

  async getInscripcionesByEquipoId(equipoId: string): Promise<Inscripcion[]> {
    if (!equipoId || equipoId.trim().length === 0) {
      throw new Error('El ID del equipo es requerido');
    }

    return await this.inscripcionRepository.getInscripcionesByEquipoId(equipoId);
  }

  async createInscripcion(data: Omit<Inscripcion, 'id' | 'fechaInscripcion'>): Promise<Inscripcion> {
    if (!data.equipoId || data.equipoId.trim().length === 0) {
      throw new Error('El ID del equipo es requerido');
    }

    if (!data.torneoId || data.torneoId.trim().length === 0) {
      throw new Error('El ID del torneo es requerido');
    }

    const equipo = await this.equipoRepository.getEquipoById(data.equipoId);

    if (!equipo) {
      throw new Error('El equipo indicado no existe');
    }

    const torneo = await this.torneoRepository.getTorneoById(data.torneoId);

    if (!torneo) {
      throw new Error('El torneo indicado no existe');
    }

    if (torneo.estado === 'finalizado') {
      throw new Error('No se puede inscribir un equipo a un torneo finalizado');
    }

    const inscripcionesDelEquipo = await this.inscripcionRepository.getInscripcionesByEquipoId(data.equipoId);

    for (const inscripcion of inscripcionesDelEquipo) {
      const torneoInscripto = await this.torneoRepository.getTorneoById(inscripcion.torneoId);

      if (torneoInscripto && torneoInscripto.estado !== 'finalizado') {
        throw new Error('El equipo ya se encuentra inscripto en un torneo activo');
      }
    }

    return await this.inscripcionRepository.createInscripcion({
      equipoId: data.equipoId,
      torneoId: data.torneoId,
      fechaInscripcion: new Date()
    });
  }

  async deleteInscripcion(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('El ID de la inscripción es requerido');
    }

    return await this.inscripcionRepository.deleteInscripcion(id);
  }
}