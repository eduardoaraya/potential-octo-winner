import { Router } from "express";
import { userController } from "@app/controllers/user.controller";
import {
  IUserModule,
  createSchema,
  updateSchema,
  searchSchema,
} from "@modules/user";

export function userRouter(router: Router, module: IUserModule) {
  const controller = userController(module);
  return [
    router.get("/", searchSchema(), controller.filter),
    router.post("/", createSchema(module), controller.create),
    router.put("/", updateSchema(module), controller.update),
    router.get("/:userId", controller.getById),
    router.delete("/:userId", controller.delete),
  ];
}
