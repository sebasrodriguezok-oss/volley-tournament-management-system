import { MongoClient, ObjectId } from 'mongodb';
import { Tournament } from './tournament.entity';
import { TournamentRepository } from './tournament.repository.interface';

export class TournamentRepositoryMongodb implements TournamentRepository {

  private readonly mongoClient: MongoClient;

  private db() {
    return this.mongoClient.db('voley_torneos');
  }

  constructor(mongoClient: MongoClient) {
    this.mongoClient = mongoClient;
  }

  async getTournaments(): Promise<Tournament[]> {
    const tournaments = await this.db().collection('tournaments').find().toArray();
    return tournaments.map(tournament => ({
      id: tournament._id.toString(),
      name: tournament.name,
      type: tournament.type,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      teamCount: tournament.teamCount,
      status: tournament.status
    }));
  }

  async getTournamentById(id: string): Promise<Tournament | null> {
    const tournament = await this.db().collection('tournaments').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!tournament) return null;

    return {
      id: tournament._id.toString(),
      name: tournament.name,
      type: tournament.type,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      teamCount: tournament.teamCount,
      status: tournament.status
    };
  }

  async createTournament(tournament: Omit<Tournament, 'id'>): Promise<Tournament> {
    const result = await this.db().collection('tournaments').insertOne(tournament);
    return {
      id: result.insertedId.toString(),
      ...tournament
    };
  }

  async updateTournament(id: string, tournament: Partial<Omit<Tournament, 'id'>>): Promise<Tournament | null> {
    const result = await this.db().collection('tournaments').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: tournament },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      name: result.name,
      type: result.type,
      startDate: result.startDate,
      endDate: result.endDate,
      teamCount: result.teamCount,
      status: result.status
    };
  }

  async deleteTournament(id: string): Promise<boolean> {
    const result = await this.db().collection('tournaments').deleteOne({ 
      _id: new ObjectId(id) 
    });
    return result.deletedCount === 1;
  }
}