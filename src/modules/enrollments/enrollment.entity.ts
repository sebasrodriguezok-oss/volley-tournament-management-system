export interface Enrollment {
  id: string;
  teamId: string;
  tournamentId: string;
  enrollmentDate: Date;
  status: 'active' | 'withdrawn' | 'cancelled';
}