export interface Equipo {
  id: string;
  nombre: string;
  categoria: string;
  entrenador?: string; // el entrenador es opcional
  cantidadJugadores: number;
}