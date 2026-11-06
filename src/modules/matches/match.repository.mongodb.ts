import { MongoClient, ObjectId } from 'mongodb';
import { config } from '../../config/config';
import { Match } from './match.entity';
import { MatchRepository } from './match.repository.interface';

export class MatchRepositoryMongodb implements MatchRepository { 

  private readonly mongoClient: MongoClient; 

  constructor(mongoClient: MongoClient) { 
    this.mongoClient = mongoClient;
  }

  private db() {
    return this.mongoClient.db(config.database.name); // Use the database name from the config
  }

  private toMatch(document: any): Match { // Convert a MongoDB document to a Match entity
    return {
      id: document._id.toString(),
      tournamentId: document.tournamentId,
      homeTeamId: document.homeTeamId,
      awayTeamId: document.awayTeamId,
      round: document.round,
      matchDate: document.matchDate,
      status: document.status,
      homeScore: document.homeScore,
      awayScore: document.awayScore
    };
  }

  async getMatches(): Promise<Match[]> { 
    const matches = await this.db()
      .collection('matches')
      .find()
      .toArray();

    return matches.map(match => this.toMatch(match));
  }

  async getMatchById(id: string): Promise<Match | null> {
    const match = await this.db()
      .collection('matches')
      .findOne({
        _id: new ObjectId(id)
      });

    if (!match) return null;

    return this.toMatch(match);
  }

  async getMatchesByTournamentId(tournamentId: string): Promise<Match[]> {
    const matches = await this.db()
      .collection('matches')
      .find({
        tournamentId
      })
      .toArray();

    return matches.map(match => this.toMatch(match));
  }

  async getMatchesByTeamId(teamId: string): Promise<Match[]> {
    const matches = await this.db()
      .collection('matches')
      .find({
        $or: [{ homeTeamId: teamId }, { awayTeamId: teamId }]
      })
      .toArray();

    return matches.map(match => this.toMatch(match));
  }

  async deleteMatchesByTournamentId(tournamentId: string): Promise<number> {
    const result = await this.db().collection('matches').deleteMany({ tournamentId });
    return result.deletedCount;
  }

  async createMatch(match: Omit<Match, 'id'>): Promise<Match> {
    const result = await this.db()
      .collection('matches')
      .insertOne(match);

    return {
      id: result.insertedId.toString(),
      ...match
    };
  }

  async updateMatch(
    id: string,
    match: Partial<Omit<Match, 'id'>> 
  ): Promise<Match | null> {

    const result = await this.db()
      .collection('matches')
      .findOneAndUpdate(
        {
          _id: new ObjectId(id)
        },
        {
          $set: match
        },
        {
          returnDocument: 'after'
        }
      );

    if (!result) return null;

    return this.toMatch(result);
  }

  async deleteMatch(id: string): Promise<boolean> {
    const result = await this.db()
      .collection('matches')
      .deleteOne({
        _id: new ObjectId(id)
      });

    return result.deletedCount === 1;
  }

}