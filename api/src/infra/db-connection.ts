import { PrismaClient } from "@prisma/client";
import { isProd } from "./environment";
import { infraLog } from "./log";

let dbConnectionCached: PrismaClient | null = null;

export async function dbConnection() {
  try {
    if (dbConnectionCached) return dbConnectionCached;

    dbConnectionCached = new PrismaClient({
      log: isProd() ? [] : ["info", "query"],
    });
    await dbConnectionCached.$connect();
    infraLog("Database connected");
    return dbConnectionCached;
  } catch (error) {
    infraLog("Error database Connection");
    throw error;
  }
}
