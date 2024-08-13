import { PrismaClient } from "@prisma/client";
import { userModule } from "@modules/user";
import { scheduleModule } from "@modules/schedule";
import { taskRepository } from "./task.repository";
import { taskService } from "./task.service";
import { ITaskModule } from "./task.contracts";

let moduleCached: ITaskModule | null = null;

export function taskModule(connection: PrismaClient): ITaskModule {
  if (moduleCached) return moduleCached;

  const repository = taskRepository(connection);
  const service = taskService(repository);
  const { service: userService } = userModule(connection);
  const { service: scheduleService } = scheduleModule(connection);

  return (moduleCached = {
    service,
    repository,
    userService: userService,
    scheduleService: scheduleService,
  });
}
