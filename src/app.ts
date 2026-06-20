import express from 'express';
import { MongoClient } from 'mongodb';
import { TournamentRepositoryMongodb } from './modules/tournaments/tournament.repository.mongodb';
import { TournamentService } from './modules/tournaments/tournament.service';
import { TournamentController } from './modules/tournaments/tournament.controller';
import { TournamentRoutes } from './modules/tournaments/tournament.routes';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

app.use(express.json());

async function main() {
  const mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  console.log('Conectado a MongoDB');

  const tournamentRepository = new TournamentRepositoryMongodb(mongoClient);
  const tournamentService = new TournamentService(tournamentRepository);
  const tournamentController = new TournamentController(tournamentService);
  const tournamentRoutes = new TournamentRoutes(tournamentController);

  app.use('/api', tournamentRoutes.router);

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

main().catch(console.error);