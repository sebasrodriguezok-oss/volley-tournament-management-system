export interface Torneo {
  id: string;
  nombre: string;
  tipo: 'todos_contra_todos' | 'por_zonas';
  fechaInicio: Date;
  fechaFin: Date;
  cantidadEquipos: number;
  estado: 'pendiente' | 'en_curso' | 'finalizado';
}