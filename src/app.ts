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

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

app.use(express.json());

async function main() {
  const mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  console.log('Conectado a MongoDB');

  const torneoRepository = new TorneoRepositoryMongodb(mongoClient);
  const torneoService = new TorneoService(torneoRepository);
  const torneoController = new TorneoController(torneoService);
  const torneoRoutes = new TorneoRoutes(torneoController);

  const equipoRepository = new EquipoRepositoryMongodb(mongoClient);
  const equipoService = new EquipoService(equipoRepository, torneoRepository);
  const equipoController = new EquipoController(equipoService);
  const equipoRoutes = new EquipoRoutes(equipoController);

  app.use('/api', equipoRoutes.router);
  app.use('/api', torneoRoutes.router);

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

main().catch(console.error);