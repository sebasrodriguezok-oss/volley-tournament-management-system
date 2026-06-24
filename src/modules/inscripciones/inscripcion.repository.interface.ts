import { Inscripcion } from './inscripcion.entity';

export interface InscripcionRepository {
  getInscripciones(): Promise<Inscripcion[]>;
  getInscripcionById(id: string): Promise<Inscripcion | null>;
  getInscripcionesByTorneoId(torneoId: string): Promise<Inscripcion[]>;
  getInscripcionesByEquipoId(equipoId: string): Promise<Inscripcion[]>;
  createInscripcion(inscripcion: Omit<Inscripcion, 'id'>): Promise<Inscripcion>;
  deleteInscripcion(id: string): Promise<boolean>;
}