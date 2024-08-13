import { Router } from "express";
import { scheduleController } from "@app/controllers/schedule.controller";
import {
  IScheduleModule,
  createSchema,
  updateSchema,
  searchSchema,
} from "@modules/schedule";

export function scheduleRouter(router: Router, module: IScheduleModule) {
  const controller = scheduleController(module);
  return [
    router.get("/", searchSchema(), controller.filter),
    router.post("/", createSchema(module), controller.create),
    router.put("/", updateSchema(module), controller.update),
    router.get("/:scheduleId", controller.getById),
    router.delete("/:scheduleId", controller.delete),
  ];
}

