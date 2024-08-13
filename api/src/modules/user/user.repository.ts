import { PrismaClient } from "@prisma/client";
import {
  IUserBase,
  IUserQueryRequest,
  IUserRepository,
  IUserCreateRequest,
  IUserUpdateRequest,
  IUserSelect,
} from "./user.contracts";

export function userRepository(dbConnection: PrismaClient): IUserRepository {
  return {
    async query(
      where: IUserQueryRequest,
      select?: IUserSelect
    ): Promise<IUserBase[]> {
      return dbConnection.user.findMany({ where, select });
    },
    async create(
      data: IUserCreateRequest,
      select?: IUserSelect
    ): Promise<IUserBase> {
      return dbConnection.user.create({ data, select });
    },
    async update(
      id: number,
      data: IUserUpdateRequest,
      select?: IUserSelect
    ): Promise<IUserBase> {
      if (!id) throw new Error("Id parameter is missing!");

      return dbConnection.user.update({
        data,
        where: { id },
        select,
      });
    },
    async delete(id: number): Promise<void> {
      if (!id) throw new Error("Id parameter is missing!");
      await dbConnection.user.delete({
        where: { id },
      });
    },
    async getById(id: number, select?: IUserSelect): Promise<IUserBase | null> {
      if (!id) throw new Error("Id parameter is missing!");

      return dbConnection.user.findUnique({
        where: { id },
        select,
      });
    },
  };
}
