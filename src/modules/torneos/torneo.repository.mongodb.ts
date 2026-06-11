import { MongoClient, ObjectId } from 'mongodb';
import { Torneo } from './torneo.entity';
import { TorneoRepository } from './torneo.repository.interface';

export class TorneoRepositoryMongodb implements TorneoRepository {

  private readonly mongoClient: MongoClient;

  private db() {
    return this.mongoClient.db('voley_torneos');
  }

  constructor(mongoClient: MongoClient) {
    this.mongoClient = mongoClient;
  }

  async getTorneos(): Promise<Torneo[]> {
    const torneos = await this.db().collection('torneos').find().toArray();
    return torneos.map(torneo => ({
      id: torneo._id.toString(),
      nombre: torneo.nombre,
      tipo: torneo.tipo,
      fechaInicio: torneo.fechaInicio,
      fechaFin: torneo.fechaFin,
      cantidadEquipos: torneo.cantidadEquipos,
      estado: torneo.estado
    }));
  }

  async getTorneoById(id: string): Promise<Torneo | null> {
    const torneo = await this.db().collection('torneos').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!torneo) return null;

    return {
      id: torneo._id.toString(),
      nombre: torneo.nombre,
      tipo: torneo.tipo,
      fechaInicio: torneo.fechaInicio,
      fechaFin: torneo.fechaFin,
      cantidadEquipos: torneo.cantidadEquipos,
      estado: torneo.estado
    };
  }

  async createTorneo(torneo: Omit<Torneo, 'id'>): Promise<Torneo> {
    const result = await this.db().collection('torneos').insertOne(torneo);
    return {
      id: result.insertedId.toString(),
      ...torneo
    };
  }

  async updateTorneo(id: string, torneo: Partial<Omit<Torneo, 'id'>>): Promise<Torneo | null> {
    const result = await this.db().collection('torneos').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: torneo },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      nombre: result.nombre,
      tipo: result.tipo,
      fechaInicio: result.fechaInicio,
      fechaFin: result.fechaFin,
      cantidadEquipos: result.cantidadEquipos,
      estado: result.estado
    };
  }

  async deleteTorneo(id: string): Promise<boolean> {
    const result = await this.db().collection('torneos').deleteOne({ 
      _id: new ObjectId(id) 
    });
    return result.deletedCount === 1;
  }
}