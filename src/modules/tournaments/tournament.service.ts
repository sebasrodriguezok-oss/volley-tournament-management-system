import { Match, MatchStatus } from '../matches/match.entity';
import { MatchRepository } from '../matches/match.repository.interface';
import { EnrollmentRepository } from '../enrollments/enrollment.repository.interface';
import { Tournament } from './tournament.entity';
import { TournamentRepository } from './tournament.repository.interface';
import { TEAM_CATEGORIES } from '../teams/team.categories';

type TournamentFields = Omit<Tournament, 'id' | 'status'>;
type TournamentUpdate = Partial<TournamentFields> & { status?: Tournament['status'] };

interface CalendarDate {
  day: string;
  value: Date;
}

export class TournamentService {
  constructor(
    private readonly tournamentRepository: TournamentRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly matchRepository: MatchRepository
  ) {}

  async getTournaments(): Promise<Tournament[]> {
    return await this.tournamentRepository.getTournaments();
  }

  async getTournamentById(id: string): Promise<Tournament | null> {
    this.validateId(id);
    return await this.tournamentRepository.getTournamentById(id);
  }

  async createTournament(tournamentData: TournamentFields & { status?: unknown }): Promise<Tournament> {
    const data = this.validateFields(tournamentData);
    const tournaments = await this.tournamentRepository.getTournaments();
    if (tournaments.some(
      (tournament) => this.normalizeName(tournament.name) === this.normalizeName(data.name)
    )) {
      throw new Error('A tournament with that name already exists');
    }
    return await this.tournamentRepository.createTournament({
      ...data,
      status: 'pending'
    });
  }

  async updateTournament(id: string, tournamentData: TournamentUpdate): Promise<Tournament | null> {
    this.validateId(id);

    if (!tournamentData || Object.keys(tournamentData).length === 0) {
      throw new Error('No data provided for update');
    }
    if (Object.prototype.hasOwnProperty.call(tournamentData, 'status')) {
      throw new Error('Tournament status is controlled by the system');
    }

    const current = await this.tournamentRepository.getTournamentById(id);
    if (!current) return null;

    const merged = { ...current, ...tournamentData };
    const validated = this.validateFields(merged);

    if (validated.teamCount < current.teamCount) {
      const enrollments = await this.enrollmentRepository.getEnrollmentsByTournamentId(id);
      if (validated.teamCount < enrollments.length) {
        throw new Error('Team count cannot be lower than the number of enrolled teams');
      }
    }

    const matches = await this.matchRepository.getMatchesByTournamentId(id);
    const structureChanged =
      validated.type !== current.type ||
      validated.category !== current.category ||
      validated.teamCount !== current.teamCount;
    if (structureChanged && (current.status !== 'pending' || matches.length > 0)) {
      throw new Error('Tournament structure cannot be changed after the fixture is generated or the tournament has started');
    }

    if (validated.category !== current.category) {
      const enrollments = await this.enrollmentRepository.getEnrollmentsByTournamentId(id);
      if (enrollments.length > 0) {
        throw new Error('Tournament category cannot change while teams are enrolled');
      }
    }

    const datesChanged =
      this.calendarDate(validated.startDate, 'Start date').day !==
        this.calendarDate(current.startDate, 'Start date').day ||
      this.calendarDate(validated.endDate, 'End date').day !==
        this.calendarDate(current.endDate, 'End date').day;
    if (datesChanged) {
      const startDay = this.calendarDate(validated.startDate, 'Start date').day;
      const endDay = this.calendarDate(validated.endDate, 'End date').day;
      if (
        matches.some((match) => {
          if (!match.matchDate) return false;
          const matchDay = this.calendarDate(match.matchDate, 'Match date').day;
          return matchDay < startDay || matchDay > endDay;
        })
      ) {
        throw new Error('Tournament dates cannot exclude scheduled matches');
      }
    }

    const tournaments = await this.tournamentRepository.getTournaments();
    const normalizedName = this.normalizeName(validated.name);
    if (tournaments.some(
      (tournament) =>
        tournament.id !== id && this.normalizeName(tournament.name) === normalizedName
    )) {
      throw new Error('A tournament with that name already exists');
    }

    return await this.tournamentRepository.updateTournament(id, validated);
  }

  async deleteTournament(id: string): Promise<boolean> {
    this.validateId(id);

    const tournament = await this.tournamentRepository.getTournamentById(id);
    if (!tournament) return false;
    if (tournament.status !== 'pending') {
      throw new Error('Only pending tournaments can be deleted');
    }

    const matches = await this.matchRepository.getMatchesByTournamentId(id);
    if (matches.some(
      (match) =>
        match.status !== MatchStatus.Scheduled ||
        match.homeScore !== null ||
        match.awayScore !== null
    )) {
      throw new Error('Tournament has played matches or recorded results and cannot be deleted');
    }

    await this.matchRepository.deleteMatchesByTournamentId(id);
    await this.enrollmentRepository.deleteEnrollmentsByTournamentId(id);
    return await this.tournamentRepository.deleteTournament(id);
  }

  async finishTournament(id: string): Promise<Tournament | null> {
    this.validateId(id);

    const tournament = await this.tournamentRepository.getTournamentById(id);
    if (!tournament) return null;
    if (tournament.status !== 'in_progress') {
      throw new Error('Only in-progress tournaments can be finalized');
    }

    const matches = await this.matchRepository.getMatchesByTournamentId(id);
    if (
      matches.length === 0 ||
      matches.some((match) =>
        match.status !== MatchStatus.Finished || !this.hasValidResult(match)
      )
    ) {
      throw new Error('Tournament cannot be finalized while matches remain unresolved');
    }

    const finalized = await this.tournamentRepository.transitionTournamentStatus(
      id,
      'in_progress',
      'finished'
    );
    if (!finalized) {
      throw new Error('Tournament status changed before it could be finalized');
    }
    return finalized;
  }

  private validateFields(data: TournamentFields): TournamentFields {
    if (!data || typeof data.name !== 'string') {
      throw new Error('Tournament name is required');
    }

    const name = data.name.trim().replace(/\s+/g, ' ');
    if (!name) throw new Error('Tournament name is required');
    if (name.length > 100) throw new Error('Tournament name must not exceed 100 characters');

    if (data.type !== 'round_robin') {
      throw new Error('Tournament type must be round_robin');
    }
    if (typeof data.category !== 'string' || !data.category.trim()) {
      throw new Error('Tournament category is required');
    }
    if (!TEAM_CATEGORIES.some((category) => category === data.category.trim())) {
      throw new Error('Tournament category is not supported');
    }

    const startDate = this.calendarDate(data.startDate, 'Start date');
    const endDate = this.calendarDate(data.endDate, 'End date');
    if (endDate.day < startDate.day) {
      throw new Error('End date must be equal to or after the start date');
    }

    this.validateTeamCount(data.teamCount);

    return {
      name,
      type: 'round_robin',
      category: data.category.trim(),
      startDate: startDate.value,
      endDate: endDate.value,
      teamCount: data.teamCount
    };
  }

  private calendarDate(value: unknown, label: string): CalendarDate {
    let day: string;

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) throw new Error(`${label} must be a valid date`);
      day = value.toISOString().slice(0, 10);
    } else if (typeof value === 'string') {
      const match = /^(\d{4}-\d{2}-\d{2})(?:T.*)?$/.exec(value);
      if (!match || Number.isNaN(Date.parse(value))) {
        throw new Error(`${label} must use a valid YYYY-MM-DD date`);
      }
      day = match[1];
    } else {
      throw new Error(`${label} is required`);
    }

    const valueDate = new Date(`${day}T00:00:00.000Z`);
    if (Number.isNaN(valueDate.getTime()) || valueDate.toISOString().slice(0, 10) !== day) {
      throw new Error(`${label} must use a valid YYYY-MM-DD date`);
    }
    return { day, value: valueDate };
  }

  private validateTeamCount(count: number): void {
    if (!Number.isInteger(count) || count < 2 || count > 16) {
      throw new Error('Tournament team count must be an integer between 2 and 16');
    }
  }

  private normalizeName(name: string): string {
    return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');
  }

  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
  }

  private hasValidResult(match: Match): boolean {
    if (match.homeScore === null || match.awayScore === null) return false;
    return (
      (match.homeScore === 2 && (match.awayScore === 0 || match.awayScore === 1)) ||
      (match.awayScore === 2 && (match.homeScore === 0 || match.homeScore === 1))
    );
  }
}
