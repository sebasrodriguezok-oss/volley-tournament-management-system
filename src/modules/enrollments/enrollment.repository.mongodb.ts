import { MongoClient, ObjectId } from 'mongodb';
import { Enrollment } from './enrollment.entity';
import { EnrollmentRepository } from './enrollment.repository.interface';

export class EnrollmentRepositoryMongodb implements EnrollmentRepository {
  private readonly mongoClient: MongoClient;

  constructor(mongoClient: MongoClient) {
    this.mongoClient = mongoClient;
  }

  private db() {
    return this.mongoClient.db('voley_torneos');
  }

  private toEnrollment(enrollment: any): Enrollment {
    return {
      id: enrollment._id.toString(),
      teamId: enrollment.teamId,
      tournamentId: enrollment.tournamentId,
      enrollmentDate: enrollment.enrollmentDate
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
    const enrollments = await this.db().collection('enrollments').find({
      tournamentId
    }).toArray();

    return enrollments.map(enrollment => this.toEnrollment(enrollment));
  }

  async getEnrollmentsByTeamId(teamId: string): Promise<Enrollment[]> {
    const enrollments = await this.db().collection('enrollments').find({
      teamId
    }).toArray();

    return enrollments.map(enrollment => this.toEnrollment(enrollment));
  }

  async createEnrollment(enrollment: Omit<Enrollment, 'id'>): Promise<Enrollment> {
    const enrollmentToInsert = {
      teamId: enrollment.teamId,
      tournamentId: enrollment.tournamentId,
      enrollmentDate: enrollment.enrollmentDate
    };

    const result = await this.db().collection('enrollments').insertOne(enrollmentToInsert);

    return {
      id: result.insertedId.toString(),
      teamId: enrollmentToInsert.teamId,
      tournamentId: enrollmentToInsert.tournamentId,
      enrollmentDate: enrollmentToInsert.enrollmentDate
    };
  }

  async deleteEnrollment(id: string): Promise<boolean> {
    const result = await this.db().collection('enrollments').deleteOne({
      _id: new ObjectId(id)
    });

    return result.deletedCount === 1;
  }
}