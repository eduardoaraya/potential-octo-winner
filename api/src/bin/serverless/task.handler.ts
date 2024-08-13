import express from "express";
import http from "@infra/http";
import { bootstrap, IApp } from "@app/bootstrap";
import serverlessExpress from "@codegenie/serverless-express";
import { taskModule } from "@modules/task";
import { taskRouter } from "@app/routes";
import AWSLambda from "aws-lambda";

let serverlessExpressInstance: AWSLambda.Handler | null = null;

async function setup() {
  const { server, connection }: IApp = await bootstrap(http);
  const router = express.Router();
  server.use("/task", taskRouter(router, taskModule(connection)));
  return server;
}

export function handle() {
  if (serverlessExpressInstance) return serverlessExpressInstance;

  return async () => {
    serverlessExpressInstance = serverlessExpress({
      app: await setup(),
    });

    return serverlessExpressInstance;
  };
}
