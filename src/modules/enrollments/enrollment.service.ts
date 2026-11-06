import { Enrollment } from './enrollment.entity';
import { EnrollmentRepository } from './enrollment.repository.interface';
import { TeamRepository } from '../teams/team.repository.interface';
import { TournamentRepository } from '../tournaments/tournament.repository.interface';
import { MatchRepository } from '../matches/match.repository.interface';

export class EnrollmentService {

  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly teamRepository: TeamRepository,
    private readonly tournamentRepository: TournamentRepository,
    private readonly matchRepository: MatchRepository
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
    await this.ensureFixtureNotGenerated(data.tournamentId);

    // Validación 4 — capacidad del torneo
    const currentEnrollments = await this.enrollmentRepository.getEnrollmentsByTournamentId(data.tournamentId);
    if (currentEnrollments.length >= tournament.teamCount) {
      throw new Error('Tournament has reached its maximum team capacity');
    }

    // Validación 5 — categoría del equipo coincide con la del torneo
    if (team.category !== tournament.category) {
      throw new Error(`Team category (${team.category}) does not match tournament category (${tournament.category})`);
    }

    // Un equipo puede inscribirse en varios torneos, pero no repetirse en el mismo.
    const teamEnrollments = await this.enrollmentRepository.getEnrollmentsByTeamId(data.teamId);
    if (teamEnrollments.some(enrollment => enrollment.tournamentId === data.tournamentId)) {
      throw new Error('Team is already enrolled in this tournament');
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
    await this.ensureEnrollmentCanChange(enrollment.tournamentId);

    return await this.enrollmentRepository.updateEnrollmentStatus(id, 'withdrawn');
  }

  async deleteEnrollment(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('Enrollment ID is required');
    }

    const enrollment = await this.enrollmentRepository.getEnrollmentById(id);
    if (!enrollment) return false;
    await this.ensureEnrollmentCanChange(enrollment.tournamentId);
    return await this.enrollmentRepository.deleteEnrollment(id);
  }

  private async ensureEnrollmentCanChange(tournamentId: string): Promise<void> {
    const tournament = await this.tournamentRepository.getTournamentById(tournamentId);
    if (!tournament || tournament.status !== 'pending') {
      throw new Error('Enrollments can only be changed for pending tournaments');
    }
    await this.ensureFixtureNotGenerated(tournamentId);
  }

  private async ensureFixtureNotGenerated(tournamentId: string): Promise<void> {
    const matches = await this.matchRepository.getMatchesByTournamentId(tournamentId);
    if (matches.length > 0) {
      throw new Error('Enrollments cannot be changed after the fixture is generated');
    }
  }
}