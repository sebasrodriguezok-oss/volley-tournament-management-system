import { MongoClient, ObjectId } from 'mongodb';
import { Inscripcion } from './inscripcion.entity';
import { InscripcionRepository } from './inscripcion.repository.interface';

export class InscripcionRepositoryMongodb implements InscripcionRepository {
  private readonly mongoClient: MongoClient;

  constructor(mongoClient: MongoClient) {
    this.mongoClient = mongoClient;
  }

  private db() {
    return this.mongoClient.db('voley_torneos');
  }

  private toInscripcion(inscripcion: any): Inscripcion { 
    return {
      id: inscripcion._id.toString(),
      equipoId: inscripcion.equipoId,
      torneoId: inscripcion.torneoId,
      fechaInscripcion: inscripcion.fechaInscripcion
    };
  }

  async getInscripciones(): Promise<Inscripcion[]> { 
    const inscripciones = await this.db().collection('inscripciones').find().toArray();
    return inscripciones.map(inscripcion => this.toInscripcion(inscripcion));
  }

  async getInscripcionById(id: string): Promise<Inscripcion | null> {
    const inscripcion = await this.db().collection('inscripciones').findOne({
      _id: new ObjectId(id)
    });

    if (!inscripcion) return null;

    return this.toInscripcion(inscripcion);
  }

  async getInscripcionesByTorneoId(torneoId: string): Promise<Inscripcion[]> {
    const inscripciones = await this.db().collection('inscripciones').find({
      torneoId
    }).toArray();

    return inscripciones.map(inscripcion => this.toInscripcion(inscripcion));
  }

  async getInscripcionesByEquipoId(equipoId: string): Promise<Inscripcion[]> {
    const inscripciones = await this.db().collection('inscripciones').find({
      equipoId
    }).toArray();

    return inscripciones.map(inscripcion => this.toInscripcion(inscripcion));
  }

  async createInscripcion(inscripcion: Omit<Inscripcion, 'id'>): Promise<Inscripcion> {
    const inscripcionAInsertar = {
      equipoId: inscripcion.equipoId,
      torneoId: inscripcion.torneoId,
      fechaInscripcion: inscripcion.fechaInscripcion
    };

    const result = await this.db().collection('inscripciones').insertOne(inscripcionAInsertar);

    return {
      id: result.insertedId.toString(),
      equipoId: inscripcionAInsertar.equipoId,
      torneoId: inscripcionAInsertar.torneoId,
      fechaInscripcion: inscripcionAInsertar.fechaInscripcion
    };
  }

  async deleteInscripcion(id: string): Promise<boolean> {
    const result = await this.db().collection('inscripciones').deleteOne({
      _id: new ObjectId(id)
    });

    return result.deletedCount === 1;
  }
}