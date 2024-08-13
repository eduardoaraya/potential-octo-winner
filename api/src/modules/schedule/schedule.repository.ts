import { PrismaClient } from "@prisma/client";
import {
  IScheduleBase,
  IScheduleQueryRequest,
  IScheduleRepository,
  IScheduleCreateRequest,
  IScheduleUpdateRequest,
  IScheduleSelect,
} from "./schedule.contracts";

export function scheduleRepository(
  dbConnection: PrismaClient
): IScheduleRepository {
  return {
    async query(
      where: IScheduleQueryRequest,
      select?: IScheduleSelect
    ): Promise<IScheduleBase[]> {
      return dbConnection.schedule.findMany({ where, select });
    },
    async create(
      data: IScheduleCreateRequest,
      select?: IScheduleSelect
    ): Promise<IScheduleBase> {
      return dbConnection.schedule.create({ data, select });
    },
    async update(
      id: string,
      data: IScheduleUpdateRequest,
      select?: IScheduleSelect
    ): Promise<IScheduleBase> {
      if (!id) throw new Error("Id parameter is missing!");
      return dbConnection.schedule.update({
        data,
        where: { id },
        select,
      });
    },
    async delete(id: string): Promise<void> {
      if (!id) throw new Error("Id parameter is missing!");
      await dbConnection.schedule.delete({
        where: { id },
      });
    },
    async getById(
      id: string,
      select?: IScheduleSelect
    ): Promise<IScheduleBase | null> {
      if (!id) throw new Error("Id parameter is missing!");
      return dbConnection.schedule.findUnique({
        where: { id },
        select,
      });
    },
  };
}
