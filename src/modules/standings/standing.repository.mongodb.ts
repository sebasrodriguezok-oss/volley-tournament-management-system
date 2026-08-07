import { MongoClient, ObjectId } from 'mongodb';
import { Standing } from './standing.entity';
import { StandingRepository } from './standing.repository.interface';
import { config } from '../../config/config';

export class StandingRepositoryMongodb implements StandingRepository {

  private readonly mongoClient: MongoClient;

  constructor(mongoClient: MongoClient) {
    this.mongoClient = mongoClient;
  }

  private db() {
    return this.mongoClient.db(config.database.name);
  }

  private toStanding(document: any): Standing {
    return {
      id: document._id.toString(),
      tournamentId: document.tournamentId,
      teamId: document.teamId,
      matchesPlayed: document.matchesPlayed,
      wins: document.wins,
      losses: document.losses,
      setsWon: document.setsWon,
      setsLost: document.setsLost,
      points: document.points
    };
  }

  async getStandingsByTournamentId(tournamentId: string): Promise<Standing[]> {
    const standings = await this.db()
      .collection('standings')
      .find({ tournamentId })
      .sort({ points: -1, setsWon: -1 }) // Ordenado por puntos, luego sets
      .toArray();

    return standings.map(standing => this.toStanding(standing));
  }

  async getStandingByTeamAndTournament(teamId: string, tournamentId: string): Promise<Standing | null> {
    const standing = await this.db()
      .collection('standings')
      .findOne({ teamId, tournamentId });

    if (!standing) return null;

    return this.toStanding(standing);
  }

  async createStanding(standing: Omit<Standing, 'id'>): Promise<Standing> {
    const result = await this.db()
      .collection('standings')
      .insertOne(standing);

    return {
      id: result.insertedId.toString(),
      ...standing
    };
  }

  async updateStanding(id: string, standing: Partial<Omit<Standing, 'id'>>): Promise<Standing | null> {
    const result = await this.db()
      .collection('standings')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: standing },
        { returnDocument: 'after' }
      );

    if (!result) return null;

    return this.toStanding(result);
  }

  async deleteStandingsByTournamentId(tournamentId: string): Promise<boolean> {
    const result = await this.db()
      .collection('standings')
      .deleteMany({ tournamentId });

    return result.deletedCount > 0;
  }
}