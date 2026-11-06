import { Team } from './team.entity';
import { TeamRepository } from './team.repository.interface';
import { TEAM_CATEGORIES, normalizeTeamName } from './team.categories';
import { EnrollmentRepository } from '../enrollments/enrollment.repository.interface';
import { MatchRepository } from '../matches/match.repository.interface';
import { TournamentRepository } from '../tournaments/tournament.repository.interface';

export class TeamService {

  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly tournamentRepository: TournamentRepository,
    private readonly matchRepository: MatchRepository
  ) {}

  async getTeams(): Promise<Team[]> {
    return await this.teamRepository.getTeams();
  }

  async getTeamById(id: string): Promise<Team | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('Team ID is required');
    }

    return await this.teamRepository.getTeamById(id);
  }

  async createTeam(teamData: Omit<Team, 'id'>): Promise<Team> {
    const normalizedData = this.normalizeTeamData(teamData);
    this.validateTeamData(normalizedData);
    await this.ensureNameIsUnique(normalizedData.name);
    return await this.teamRepository.createTeam(normalizedData);
  }

  async updateTeam(id: string, teamData: Partial<Omit<Team, 'id'>>): Promise<Team | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('Team ID is required');
    }

    if (Object.keys(teamData).length === 0) {
      throw new Error('No data provided for update');
    }

    const existingTeam = await this.teamRepository.getTeamById(id);
    if (!existingTeam) {
      return null;
    }

    const normalizedChanges = this.normalizeTeamData(teamData);
    const updatedTeam = { ...existingTeam, ...normalizedChanges };
    this.validateTeamData(updatedTeam);

    if (normalizedChanges.name !== undefined) {
      await this.ensureNameIsUnique(normalizedChanges.name, id);
    }

    if (
      normalizedChanges.category !== undefined &&
      normalizedChanges.category !== existingTeam.category
    ) {
      const activeEnrollments = (await this.enrollmentRepository.getEnrollmentsByTeamId(id))
        .filter(enrollment => enrollment.status === 'active');

      for (const enrollment of activeEnrollments) {
        const tournament = await this.tournamentRepository.getTournamentById(enrollment.tournamentId);
        if (tournament && tournament.category !== normalizedChanges.category) {
          throw new Error(
            `Team category cannot be changed while it has an active enrollment in a ${tournament.category} tournament`
          );
        }
      }
    }

    return await this.teamRepository.updateTeam(id, normalizedChanges);
  }

  async deleteTeam(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('Team ID is required');
    }

    const team = await this.teamRepository.getTeamById(id);

    if (!team) {
      return false;
    }

    const activeEnrollments = (await this.enrollmentRepository.getEnrollmentsByTeamId(id))
      .filter(enrollment => enrollment.status === 'active');
    if (activeEnrollments.length > 0) {
      throw new Error('Team cannot be deleted while it has active enrollments');
    }

    const finishedMatches = (await this.matchRepository.getMatchesByTeamId(id))
      .filter(match => match.status === 'finished');
    if (finishedMatches.length > 0) {
      throw new Error('Team cannot be deleted because it has played matches');
    }

    return await this.teamRepository.deleteTeam(id);
  }

  private normalizeTeamData<T extends Partial<Omit<Team, 'id'>>>(data: T): T {
    const normalized = { ...data };

    if (typeof normalized.name === 'string') {
      normalized.name = normalized.name.trim().replace(/\s+/g, ' ') as T['name'];
    }

    if (typeof normalized.category === 'string') {
      normalized.category = normalized.category.trim() as T['category'];
    }

    if (typeof normalized.coach === 'string') {
      normalized.coach = normalized.coach.trim() as T['coach'];
    }

    return normalized;
  }

  private async ensureNameIsUnique(name: string, excludedId?: string): Promise<void> {
    const normalizedName = normalizeTeamName(name);
    const teams = await this.teamRepository.getTeams();
    const duplicate = teams.find(
      team => team.id !== excludedId && normalizeTeamName(team.name) === normalizedName
    );

    if (duplicate) {
      throw new Error('A team with this name already exists');
    }
  }

  private validateTeamData(data: Partial<Omit<Team, 'id'>>): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Team name is required');
    }

    if (data.name.length > 100) {
      throw new Error('Team name must not exceed 100 characters');
    }

    if (!data.category || !TEAM_CATEGORIES.includes(data.category as typeof TEAM_CATEGORIES[number])) {
      throw new Error('Team category is not supported');
    }

    if (
      data.playerCount === undefined ||
      !Number.isInteger(data.playerCount) ||
      data.playerCount < 6
    ) {
      throw new Error('Team must have at least 6 players');
    }
  }
}