import { Enrollment } from './enrollment.entity';

export interface EnrollmentRepository {
  getEnrollments(): Promise<Enrollment[]>;
  getEnrollmentById(id: string): Promise<Enrollment | null>;
  getEnrollmentsByTournamentId(tournamentId: string): Promise<Enrollment[]>;
  getEnrollmentsByTeamId(teamId: string): Promise<Enrollment[]>;
  createEnrollment(enrollment: Omit<Enrollment, 'id'>): Promise<Enrollment>;
  deleteEnrollment(id: string): Promise<boolean>;
}