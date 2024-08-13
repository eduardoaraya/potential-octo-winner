import { Express } from "express";
import { PrismaClient } from "@prisma/client";
import { dbConnection } from "@infra/db-connection";

export interface IApp {
  connection: PrismaClient;
  server: Express;
  port: number;
  apiVersion: string;
}

export async function bootstrap(server: Express): Promise<IApp> {
  const defaultPort = 3000;
  const defaultApiVersion = "beta";
  const connection = await dbConnection();
  return {
    connection,
    server,
    port: Number(process.env.PORT) ?? defaultPort,
    apiVersion: process.env?.API_VERSION?.toString() ?? defaultApiVersion,
  };
}
