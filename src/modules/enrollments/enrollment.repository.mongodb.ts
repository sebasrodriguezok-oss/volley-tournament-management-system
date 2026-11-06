import { MongoClient, ObjectId } from 'mongodb';
import { config } from '../../config/config';
import { Enrollment } from './enrollment.entity';
import { EnrollmentRepository } from './enrollment.repository.interface';

export class EnrollmentRepositoryMongodb implements EnrollmentRepository {
  private readonly mongoClient: MongoClient;

  constructor(mongoClient: MongoClient) {
    this.mongoClient = mongoClient;
  }

  private db() {
    return this.mongoClient.db(config.database.name);
  }

  private toEnrollment(enrollment: any): Enrollment {
    return {
      id: enrollment._id.toString(),
      teamId: enrollment.teamId,
      tournamentId: enrollment.tournamentId,
      enrollmentDate: enrollment.enrollmentDate,
      status: enrollment.status
    };
  }

  async getEnrollments(): Promise<Enrollment[]> {
    const enrollments = await this.db().collection('enrollments').find().toArray();
    return enrollments.map(enrollment => this.toEnrollment(enrollment));
  }

  async getEnrollmentById(id: string): Promise<Enrollment | null> {
    const enrollment = await this.db().collection('enrollments').findOne({
      _id: new ObjectId(id)
    });

    if (!enrollment) return null;

    return this.toEnrollment(enrollment);
  }

  async getEnrollmentsByTournamentId(tournamentId: string): Promise<Enrollment[]> {
    // Solo traemos inscripciones activas
    const enrollments = await this.db().collection('enrollments').find({
      tournamentId,
      status: 'active'
    }).toArray();

    return enrollments.map(enrollment => this.toEnrollment(enrollment));
  }

  async getEnrollmentsByTeamId(teamId: string): Promise<Enrollment[]> {
    // Traemos todo el historial del equipo
    const enrollments = await this.db().collection('enrollments').find({
      teamId
    }).toArray();

    return enrollments.map(enrollment => this.toEnrollment(enrollment));
  }

  async createEnrollment(enrollment: Omit<Enrollment, 'id'>): Promise<Enrollment> {
    const enrollmentToInsert = {
      teamId: enrollment.teamId,
      tournamentId: enrollment.tournamentId,
      enrollmentDate: enrollment.enrollmentDate,
      status: enrollment.status
    };

    const result = await this.db().collection('enrollments').insertOne(enrollmentToInsert);

    return {
      id: result.insertedId.toString(),
      ...enrollmentToInsert
    };
  }

  async updateEnrollmentStatus(id: string, status: Enrollment['status']): Promise<Enrollment | null> {
    const result = await this.db().collection('enrollments').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status } },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return this.toEnrollment(result);
  }

  async deleteEnrollment(id: string): Promise<boolean> {
    const result = await this.db().collection('enrollments').deleteOne({
      _id: new ObjectId(id)
    });

    return result.deletedCount === 1;
  }

  async deleteEnrollmentsByTournamentId(tournamentId: string): Promise<number> {
    const result = await this.db().collection('enrollments').deleteMany({ tournamentId });
    return result.deletedCount;
  }
}