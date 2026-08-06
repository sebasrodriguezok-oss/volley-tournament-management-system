import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 27017,
    name: process.env.DB_NAME || 'voley_torneos',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    uri:
        process.env.MONGO_URI ??
        `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}`
  }
};