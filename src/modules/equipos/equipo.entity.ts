export interface Equipo {
  id: string;
  nombre: string;
  torneoId: string; //como un equipo pertenece a un torneo, se asocia mediante el ID del torneo
  categoria: string;
  entrenador?: string; // el entrenador es opcional
  cantidadJugadores: number;
}