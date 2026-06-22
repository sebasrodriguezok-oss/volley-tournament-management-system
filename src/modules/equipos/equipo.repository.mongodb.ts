import { MongoClient, ObjectId } from 'mongodb';
import { Equipo } from './equipo.entity';
import { EquipoRepository } from './equipo.repository.interface';

export class EquipoRepositoryMongodb implements EquipoRepository {
  private readonly mongoClient: MongoClient;

  constructor(mongoClient: MongoClient) {
    this.mongoClient = mongoClient;
  }

  private db() {
    return this.mongoClient.db('voley_torneos');
  }

  async getEquipos(): Promise<Equipo[]> {
    const equipos = await this.db().collection('equipos').find().toArray();

    return equipos.map(equipo => ({
      id: equipo._id.toString(),
      nombre: equipo.nombre,
      torneoId: equipo.torneoId,
      categoria: equipo.categoria,
      entrenador: equipo.entrenador,
      cantidadJugadores: equipo.cantidadJugadores
    }));
  }

  async getEquipoById(id: string): Promise<Equipo | null> {
    const equipo = await this.db().collection('equipos').findOne({
      _id: new ObjectId(id)
    });

    if (!equipo) return null;

    return {
      id: equipo._id.toString(),
      nombre: equipo.nombre,
      torneoId: equipo.torneoId,
      categoria: equipo.categoria,
      entrenador: equipo.entrenador,
      cantidadJugadores: equipo.cantidadJugadores
    };
  }

  async createEquipo(equipo: Omit<Equipo, 'id'>): Promise<Equipo> {
    const result = await this.db().collection('equipos').insertOne(equipo);

    return {
      id: result.insertedId.toString(),
      ...equipo
    };
  }

  async updateEquipo(id: string, equipo: Partial<Omit<Equipo, 'id'>>): Promise<Equipo | null> {
    const result = await this.db().collection('equipos').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: equipo },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      nombre: result.nombre,
      torneoId: result.torneoId,
      categoria: result.categoria,
      entrenador: result.entrenador,
      cantidadJugadores: result.cantidadJugadores
    };
  }

  async deleteEquipo(id: string): Promise<boolean> {
    const result = await this.db().collection('equipos').deleteOne({
      _id: new ObjectId(id)
    });

    return result.deletedCount === 1;
  }
}