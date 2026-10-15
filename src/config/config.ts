import dotenv from 'dotenv';

dotenv.config();

const databaseHost = process.env.DB_HOST || 'localhost';
const databasePort = Number(process.env.DB_PORT) || 27017;
const databaseName = process.env.DB_NAME || 'voley_torneos';
const databaseUser = process.env.DB_USER || 'root';
const databasePassword = process.env.DB_PASSWORD || 'example';

export const config = {
  port: Number(process.env.PORT) || 3000,

  database: {
    host: databaseHost,
    port: databasePort,
    name: databaseName,
    user: databaseUser,
    password: databasePassword,
    uri:
      process.env.MONGO_URI ||
      `mongodb://${databaseUser}:${databasePassword}@${databaseHost}:${databasePort}/${databaseName}?authSource=admin`
  }
};