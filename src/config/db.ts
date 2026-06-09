import { MongoClient, Db } from "mongodb";

const URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "voley_torneos";

let db: Db;

export async function connectDB(): Promise<void> {
  const client = new MongoClient(URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log("Conectado a MongoDB");
}

export function getDB(): Db {
  if (!db) throw new Error("La base de datos no está conectada");
  return db;
}