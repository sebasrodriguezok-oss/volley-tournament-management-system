import { Torneo } from './torneo.entity';

export interface TorneoRepository {
  getTorneos(): Promise<Torneo[]>;
  getTorneoById(id: string): Promise<Torneo | null>;
  createTorneo(torneo: Omit<Torneo, 'id'>): Promise<Torneo>;
  updateTorneo(id: string, torneo: Partial<Omit<Torneo, 'id'>>): Promise<Torneo | null>;
  deleteTorneo(id: string): Promise<boolean>;
}