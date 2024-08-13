import { Router } from "express";
import { taskController } from "@app/controllers/task.controller";
import {
  ITaskModule,
  createSchema,
  updateSchema,
  searchSchema,
} from "@modules/task";

export function taskRouter(router: Router, module: ITaskModule) {
  const controller = taskController(module);
  return [
    router.post("/", createSchema(module), controller.create),
    router.put("/", updateSchema(module), controller.update),
    router.get("/", searchSchema(), controller.filter),
    router.get("/:taskId", controller.getById),
    router.delete("/:taskId", controller.delete),
  ];
}
