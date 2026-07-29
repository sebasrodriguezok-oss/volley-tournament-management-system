import { Enrollment } from './enrollment.entity';
import { EnrollmentRepository } from './enrollment.repository.interface';
import { TeamRepository } from '../teams/team.repository.interface';
import { TournamentRepository } from '../tournaments/tournament.repository.interface';

export class EnrollmentService {

  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly teamRepository: TeamRepository,
    private readonly tournamentRepository: TournamentRepository
  ) {}

  async getEnrollments(): Promise<Enrollment[]> {
    return await this.enrollmentRepository.getEnrollments();
  }

  async getEnrollmentById(id: string): Promise<Enrollment | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('Enrollment ID is required');
    }

    return await this.enrollmentRepository.getEnrollmentById(id);
  }

  async getEnrollmentsByTournamentId(tournamentId: string): Promise<Enrollment[]> {
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }

    // Verificamos que el torneo existe
    const tournament = await this.tournamentRepository.getTournamentById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const enrollments = await this.enrollmentRepository.getEnrollmentsByTournamentId(tournamentId);

    // Enriquecemos la respuesta con los datos del torneo y los equipos
    const teamsDetails = await Promise.all(
      enrollments.map(async enrollment => {
        const team = await this.teamRepository.getTeamById(enrollment.teamId);
        return { enrollment, team };
      })
    );

    return enrollments;
  }

  async getEnrollmentsByTeamId(teamId: string): Promise<Enrollment[]> {
    if (!teamId || teamId.trim().length === 0) {
      throw new Error('Team ID is required');
    }

    // Verificamos que el equipo existe
    const team = await this.teamRepository.getTeamById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    return await this.enrollmentRepository.getEnrollmentsByTeamId(teamId);
  }

  async createEnrollment(data: Omit<Enrollment, 'id' | 'enrollmentDate' | 'status'>): Promise<Enrollment> {
    if (!data.teamId || data.teamId.trim().length === 0) {
      throw new Error('Team ID is required');
    }

    if (!data.tournamentId || data.tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }

    // Validación 1 — el equipo existe
    const team = await this.teamRepository.getTeamById(data.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Validación 2 — el torneo existe
    const tournament = await this.tournamentRepository.getTournamentById(data.tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Validación 3 — el torneo permite inscripciones
    if (tournament.status !== 'pending') {
      throw new Error('Tournament is not open for enrollment');
    }

    // Validación 4 — capacidad del torneo
    const currentEnrollments = await this.enrollmentRepository.getEnrollmentsByTournamentId(data.tournamentId);
    if (currentEnrollments.length >= tournament.teamCount) {
      throw new Error('Tournament has reached its maximum team capacity');
    }

    // Validación 5 — categoría del equipo coincide con la del torneo
    if (team.category !== tournament.category) {
      throw new Error(`Team category (${team.category}) does not match tournament category (${tournament.category})`);
    }

    // Validación 6 — el equipo no está en otro torneo activo
    const teamEnrollments = await this.enrollmentRepository.getEnrollmentsByTeamId(data.teamId);
    for (const enrollment of teamEnrollments) {
      if (enrollment.status === 'active') {
        const enrolledTournament = await this.tournamentRepository.getTournamentById(enrollment.tournamentId);
        if (enrolledTournament && enrolledTournament.status !== 'finished') {
          throw new Error('Team is already enrolled in an active tournament');
        }
      }
    }

    return await this.enrollmentRepository.createEnrollment({
      teamId: data.teamId,
      tournamentId: data.tournamentId,
      enrollmentDate: new Date(),
      status: 'active'
    });
  }

  // Baja lógica — cambia el status a withdrawn en vez de borrar
  async withdrawEnrollment(id: string): Promise<Enrollment | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('Enrollment ID is required');
    }

    const enrollment = await this.enrollmentRepository.getEnrollmentById(id);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    if (enrollment.status !== 'active') {
      throw new Error('Enrollment is not active');
    }

    return await this.enrollmentRepository.updateEnrollmentStatus(id, 'withdrawn');
  }

  async deleteEnrollment(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('Enrollment ID is required');
    }

    return await this.enrollmentRepository.deleteEnrollment(id);
  }
}