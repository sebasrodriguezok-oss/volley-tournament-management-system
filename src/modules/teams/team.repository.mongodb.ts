import { MongoClient, ObjectId } from 'mongodb';
import { config } from '../../config/config';
import { Team } from './team.entity';
import { TeamRepository } from './team.repository.interface';

export class TeamRepositoryMongodb implements TeamRepository {
  private readonly mongoClient: MongoClient;

  constructor(mongoClient: MongoClient) {
    this.mongoClient = mongoClient;
  }

  private db() {
    return this.mongoClient.db(config.database.name);
  }

  async getTeams(): Promise<Team[]> {
    const teams = await this.db().collection('teams').find().toArray();

    return teams.map(team => ({
      id: team._id.toString(),
      name: team.name,
      category: team.category,
      coach: team.coach,
      playerCount: team.playerCount
    }));
  }

  async getTeamById(id: string): Promise<Team | null> {
    const team = await this.db().collection('teams').findOne({
      _id: new ObjectId(id)
    });

    if (!team) return null;

    return {
      id: team._id.toString(),
      name: team.name,
      category: team.category,
      coach: team.coach,
      playerCount: team.playerCount
    };
  }

  async createTeam(team: Omit<Team, 'id'>): Promise<Team> {
    const teamToInsert = {
      name: team.name,
      category: team.category,
      coach: team.coach,
      playerCount: team.playerCount
    };

    const result = await this.db().collection('teams').insertOne(teamToInsert);

    return {
      id: result.insertedId.toString(),
      name: teamToInsert.name,
      category: teamToInsert.category,
      coach: teamToInsert.coach,
      playerCount: teamToInsert.playerCount
    };
  }

  async updateTeam(id: string, team: Partial<Omit<Team, 'id'>>): Promise<Team | null> {
    const result = await this.db().collection('teams').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: team },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      name: result.name,
      category: result.category,
      coach: result.coach,
      playerCount: result.playerCount
    };
  }

  async deleteTeam(id: string): Promise<boolean> {
    const result = await this.db().collection('teams').deleteOne({
      _id: new ObjectId(id)
    });

    return result.deletedCount === 1;
  }
}