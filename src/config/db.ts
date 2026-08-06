import { MongoClient, Db } from "mongodb";
import { config } from "./config";

let db: Db;

export async function connectDB(): Promise<void> {
  const client = new MongoClient(config.database.uri);

  await client.connect();

  db = client.db(config.database.name);

  console.log("Conectado a MongoDB");
}

export function getDB(): Db {
  if (!db) {
    throw new Error("La base de datos no está conectada");
  }

  return db;
}