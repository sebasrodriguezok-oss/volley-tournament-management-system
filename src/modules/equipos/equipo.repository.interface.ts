import { Equipo } from './equipo.entity';

export interface EquipoRepository {
  getEquipos(): Promise<Equipo[]>;
  getEquipoById(id: string): Promise<Equipo | null>;
  createEquipo(equipo: Omit<Equipo, 'id'>): Promise<Equipo>;
  updateEquipo(id: string, equipo: Partial<Omit<Equipo, 'id'>>): Promise<Equipo | null>;
  deleteEquipo(id: string): Promise<boolean>; 
}