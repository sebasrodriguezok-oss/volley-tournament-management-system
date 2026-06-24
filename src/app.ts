import express from 'express';
import { MongoClient } from 'mongodb';

import { TorneoRepositoryMongodb } from './modules/torneos/torneo.repository.mongodb';
import { TorneoService } from './modules/torneos/torneo.service';
import { TorneoController } from './modules/torneos/torneo.controller';
import { TorneoRoutes } from './modules/torneos/torneo.routes';

import { EquipoRepositoryMongodb } from './modules/equipos/equipo.repository.mongodb';
import { EquipoService } from './modules/equipos/equipo.service';
import { EquipoController } from './modules/equipos/equipo.controller';
import { EquipoRoutes } from './modules/equipos/equipo.routes';

import { InscripcionRepositoryMongodb } from './modules/inscripciones/inscripcion.repository.mongodb';
import { InscripcionService } from './modules/inscripciones/inscripcion.service';
import { InscripcionController } from './modules/inscripciones/inscripcion.controller';
import { InscripcionRoutes } from './modules/inscripciones/inscripcion.routes';

export class App {

  public readonly app;
  private mongoClient?: MongoClient;

  private readonly PORT = process.env.PORT || 3000;
  private readonly MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

  constructor() {
    this.app = express();

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  public async start() {
    this.mongoClient = new MongoClient(this.MONGO_URI);
    await this.mongoClient.connect();

    console.log('Conectado a MongoDB');

    const torneoRepository = new TorneoRepositoryMongodb(this.mongoClient);
    const torneoService = new TorneoService(torneoRepository);
    const torneoController = new TorneoController(torneoService);
    const torneoRoutes = new TorneoRoutes(torneoController);

    const equipoRepository = new EquipoRepositoryMongodb(this.mongoClient);
    const equipoService = new EquipoService(equipoRepository, torneoRepository);
    const equipoController = new EquipoController(equipoService);
    const equipoRoutes = new EquipoRoutes(equipoController);

    const inscripcionRepository = new InscripcionRepositoryMongodb(this.mongoClient);
    const inscripcionService = new InscripcionService(inscripcionRepository, equipoRepository, torneoRepository);
    const inscripcionController = new InscripcionController(inscripcionService);
    const inscripcionRoutes = new InscripcionRoutes(inscripcionController);
    
    this.app.use('/api', torneoRoutes.router);
    this.app.use('/api', equipoRoutes.router);
    this.app.use('/api', inscripcionRoutes.router);

    this.app.listen(this.PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${this.PORT}`);
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