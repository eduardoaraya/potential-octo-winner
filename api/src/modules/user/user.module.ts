import { PrismaClient } from "@prisma/client";
import { userRepository } from "./user.repository";
import { userService } from "./user.service";
import { IUserModule } from "./user.contracts";

let moduleCached: IUserModule | null = null;

export function userModule(connection: PrismaClient): IUserModule {
  if (moduleCached) return moduleCached;

  const repository = userRepository(connection);
  const service = userService(repository);

  return (moduleCached = {
    service,
    repository,
  });
}
