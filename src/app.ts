import express from 'express';
import { MongoClient } from 'mongodb';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { config } from './config/config';
import cors from 'cors';

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

import { MatchRepositoryMongodb } from './modules/matches/match.repository.mongodb';
import { MatchService } from './modules/matches/match.service';
import { MatchController } from './modules/matches/match.controller';
import { MatchRoutes } from './modules/matches/match.routes';

import { FixtureController } from './modules/fixture/fixture.controller';
import { FixtureRoutes } from './modules/fixture/fixture.routes';
import { FixtureService } from './modules/fixture/fixture.service';
import { RoundRobinGenerator } from './modules/fixture/round-robin.generator';

import { StandingRepositoryMongodb } from './modules/standings/standing.repository.mongodb';
import { StandingService } from './modules/standings/standing.service';
import { StandingController } from './modules/standings/standing.controller';
import { StandingRoutes } from './modules/standings/standing.routes';

export class App {

  public readonly app;
  private mongoClient?: MongoClient;

  private readonly PORT = config.port;

  constructor() {
    this.app = express();

    this.app.use(
      cors({
        origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );

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
    const teamRepository = new TeamRepositoryMongodb(this.mongoClient);
    const enrollmentRepository = new EnrollmentRepositoryMongodb(this.mongoClient);
    const matchRepository = new MatchRepositoryMongodb(this.mongoClient);
    const tournamentService = new TournamentService(
      tournamentRepository,
      enrollmentRepository,
      matchRepository
    );
    const tournamentController = new TournamentController(tournamentService);
    const tournamentRoutes = new TournamentRoutes(tournamentController);

    const teamService = new TeamService(
      teamRepository,
      enrollmentRepository,
      tournamentRepository,
      matchRepository
    );
    const teamController = new TeamController(teamService);
    const teamRoutes = new TeamRoutes(teamController);

    const enrollmentService = new EnrollmentService(
      enrollmentRepository,
      teamRepository,
      tournamentRepository,
      matchRepository
    );
    const enrollmentController = new EnrollmentController(enrollmentService);
    const enrollmentRoutes = new EnrollmentRoutes(enrollmentController);

    const standingRepository = new StandingRepositoryMongodb(this.mongoClient);
    const standingService = new StandingService(
      standingRepository,
      matchRepository,
      enrollmentRepository
    );
    const standingController = new StandingController(standingService);
    const standingRoutes = new StandingRoutes(standingController);

    const matchService = new MatchService(
      matchRepository,
      standingService,
      tournamentRepository,
      tournamentService
    );
    const matchController = new MatchController(matchService);
    const matchRoutes = new MatchRoutes(matchController);

    const roundRobinGenerator = new RoundRobinGenerator();
    const fixtureService = new FixtureService(
      tournamentRepository,
      enrollmentRepository,
      matchRepository,
      teamRepository,
      roundRobinGenerator
    );
    const fixtureController = new FixtureController(fixtureService);
    const fixtureRoutes = new FixtureRoutes(fixtureController);

    this.app.use('/api', tournamentRoutes.router);
    this.app.use('/api', teamRoutes.router);
    this.app.use('/api', enrollmentRoutes.router);
    this.app.use('/api', matchRoutes.router);
    this.app.use('/api', fixtureRoutes.router);
    this.app.use('/api', standingRoutes.router);

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