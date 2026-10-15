import express from 'express';
import { MongoClient } from 'mongodb';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { config } from './config/config';

import { TournamentRepositoryMongodb } from './modules/tournaments/tournament.repository.mongodb';
import { TournamentService } from './modules/tournaments/tournament.service';
import { TournamentController } from './modules/tournaments/tournament.controller';
import { TournamentRoutes } from './modules/tournaments/tournament.routes';

import { TeamRepositoryMongodb } from './modules/teams/team.repository.mongodb';
import { TeamService } from './modules/teams/team.service';
import { TeamController } from './modules/teams/team.controller';
import { TeamRoutes } from './modules/teams/team.routes';

import { EnrollmentRepositoryMongodb } from './modules/enrollments/enrollment.repository.mongodb';
import { EnrollmentService } from './modules/enrollments/enrollment.service';
import { EnrollmentController } from './modules/enrollments/enrollment.controller';
import { EnrollmentRoutes } from './modules/enrollments/enrollment.routes';

export class App {

  public readonly app;
  private mongoClient?: MongoClient;

  private readonly PORT = config.port;

  constructor() {
    this.app = express();

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Swagger — disponible en http://localhost:3000/api-docs
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  public async start() {
    this.mongoClient = new MongoClient(config.database.uri);
    await this.mongoClient.connect();

    console.log('Connected to MongoDB');

    const tournamentRepository = new TournamentRepositoryMongodb(this.mongoClient);
    const tournamentService = new TournamentService(tournamentRepository);
    const tournamentController = new TournamentController(tournamentService);
    const tournamentRoutes = new TournamentRoutes(tournamentController);

    const teamRepository = new TeamRepositoryMongodb(this.mongoClient);
    const teamService = new TeamService(teamRepository);
    const teamController = new TeamController(teamService);
    const teamRoutes = new TeamRoutes(teamController);

    const enrollmentRepository = new EnrollmentRepositoryMongodb(this.mongoClient);
    const enrollmentService = new EnrollmentService(enrollmentRepository, teamRepository, tournamentRepository);
    const enrollmentController = new EnrollmentController(enrollmentService);
    const enrollmentRoutes = new EnrollmentRoutes(enrollmentController);

    this.app.use('/api', tournamentRoutes.router);
    this.app.use('/api', teamRoutes.router);
    this.app.use('/api', enrollmentRoutes.router);

    this.app.listen(this.PORT, () => {
      console.log(`Server running at http://localhost:${this.PORT}`);
      console.log(`Swagger docs available at http://localhost:${this.PORT}/api-docs`);
    });

    console.log('App started');
  }

  public shutdown() {
    console.log('Shutting down app...');

    this.close().then(() => {
      process.exit(0);
    });
  }

  public async close() {
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
  }
}