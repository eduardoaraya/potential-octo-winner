import { PrismaClient } from "@prisma/client";
import { scheduleRepository } from "./schedule.repository";
import { scheduleService } from "./schedule.service";
import { IScheduleModule } from "./schedule.contracts";
import { userModule } from "@modules/user";

let moduleCached: IScheduleModule | null = null;

export function scheduleModule(connection: PrismaClient): IScheduleModule {
  if (moduleCached) return moduleCached;

  const repository = scheduleRepository(connection);
  const service = scheduleService(repository);
  const { service: userService } = userModule(connection);

  return (moduleCached = {
    service,
    repository,
    userService,
  });
}
