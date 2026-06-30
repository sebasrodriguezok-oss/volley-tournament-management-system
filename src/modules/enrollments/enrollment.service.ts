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

    return await this.enrollmentRepository.getEnrollmentsByTournamentId(tournamentId);
  }

  async getEnrollmentsByTeamId(teamId: string): Promise<Enrollment[]> {
    if (!teamId || teamId.trim().length === 0) {
      throw new Error('Team ID is required');
    }

    return await this.enrollmentRepository.getEnrollmentsByTeamId(teamId);
  }

  async createEnrollment(data: Omit<Enrollment, 'id' | 'enrollmentDate'>): Promise<Enrollment> {
    if (!data.teamId || data.teamId.trim().length === 0) {
      throw new Error('Team ID is required');
    }

    if (!data.tournamentId || data.tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }

    const team = await this.teamRepository.getTeamById(data.teamId);

    if (!team) {
      throw new Error('Team not found');
    }

    const tournament = await this.tournamentRepository.getTournamentById(data.tournamentId);

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status === 'finished') {
      throw new Error('Cannot enroll a team in a finished tournament');
    }

    const teamEnrollments = await this.enrollmentRepository.getEnrollmentsByTeamId(data.teamId);

    for (const enrollment of teamEnrollments) {
      const enrolledTournament = await this.tournamentRepository.getTournamentById(enrollment.tournamentId);

      if (enrolledTournament && enrolledTournament.status !== 'finished') {
        throw new Error('Team is already enrolled in an active tournament');
      }
    }

    return await this.enrollmentRepository.createEnrollment({
      teamId: data.teamId,
      tournamentId: data.tournamentId,
      enrollmentDate: new Date()
    });
  }

  async deleteEnrollment(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('Enrollment ID is required');
    }

    return await this.enrollmentRepository.deleteEnrollment(id);
  }
}