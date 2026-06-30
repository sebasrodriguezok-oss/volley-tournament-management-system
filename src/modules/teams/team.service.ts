import { Team } from './team.entity';
import { TeamRepository } from './team.repository.interface';

export class TeamService {

  constructor(
    private readonly teamRepository: TeamRepository
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
    this.validateTeamData(teamData);
    return await this.teamRepository.createTeam(teamData);
  }

  async updateTeam(id: string, teamData: Partial<Omit<Team, 'id'>>): Promise<Team | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('Team ID is required');
    }

    if (Object.keys(teamData).length === 0) {
      throw new Error('No data provided for update');
    }

    if (teamData.name !== undefined) {
      if (!teamData.name || teamData.name.trim().length === 0) {
        throw new Error('Team name is required');
      }

      if (teamData.name.length > 100) {
        throw new Error('Team name must not exceed 100 characters');
      }
    }

    if (teamData.category !== undefined && (!teamData.category || teamData.category.trim().length === 0)) {
      throw new Error('Team category is required');
    }

    if (teamData.playerCount !== undefined && teamData.playerCount < 1) {
      throw new Error('Team must have at least one player');
    }

    return await this.teamRepository.updateTeam(id, teamData);
  }

  async deleteTeam(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('Team ID is required');
    }

    const team = await this.teamRepository.getTeamById(id);

    if (!team) {
      return false;
    }

    return await this.teamRepository.deleteTeam(id);
  }

  private validateTeamData(data: Omit<Team, 'id'>): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Team name is required');
    }

    if (data.name.length > 100) {
      throw new Error('Team name must not exceed 100 characters');
    }

    if (!data.category || data.category.trim().length === 0) {
      throw new Error('Team category is required');
    }

    if (data.playerCount < 1) {
      throw new Error('Team must have at least one player');
    }
  }
}