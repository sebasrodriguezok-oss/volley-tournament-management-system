import { Team } from './team.entity';

export interface TeamRepository {
  getTeams(): Promise<Team[]>;
  getTeamById(id: string): Promise<Team | null>;
  createTeam(team: Omit<Team, 'id'>): Promise<Team>;
  updateTeam(id: string, team: Partial<Omit<Team, 'id'>>): Promise<Team | null>;
  deleteTeam(id: string): Promise<boolean>;
}