import express, { Request, Response } from "express";
import { bootstrap, IApp } from "@app/bootstrap";
import http from "@infra/http";

// Routes
import { scheduleRouter, userRouter, taskRouter } from "@app/routes";

// Modules
import { taskModule } from "@modules/task";
import { userModule } from "@modules/user";
import { scheduleModule } from "@modules/schedule";

bootstrap(http).then(({ server, port, apiVersion, connection }: IApp) => {
  server.get("/", (_req: Request, res: Response) => {
    res.status(200).send({
      status: "Ok",
      apiVersion,
    });
  });

  server.use("/tasks", taskRouter(express.Router(), taskModule(connection)));
  server.use(
    "/schedules",
    scheduleRouter(express.Router(), scheduleModule(connection))
  );
  server.use("/users", userRouter(express.Router(), userModule(connection)));

  server.listen(port, () => console.log(`Server on: http://0.0.0.0:${port}`));
});
