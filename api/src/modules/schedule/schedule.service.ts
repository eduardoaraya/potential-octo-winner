import {
  IScheduleUpdateRequest,
  IScheduleRepository,
  IScheduleCreateRequest,
  IScheduleFilterRequest,
  IScheduleService,
} from "./schedule.contracts";
import { IUserBase } from "@modules/user";

export function scheduleService(
  repository: IScheduleRepository
): IScheduleService {
  return {
    async verifyConflictingAppointments(
      user: IUserBase,
      startTime: Date | string,
      endTime: Date | string
    ): Promise<boolean> {
      const betweenDates = {
        lte: new Date(endTime),
        gte: new Date(startTime),
      };
      const result = await repository.query({
        OR: [
          {
            accountId: user.id,
            startTime: betweenDates,
          },
          {
            accountId: user.id,
            endTime: betweenDates,
          },
        ],
      });
      return result.length > 0;
    },
    async filter({
      accountId,
      agentId,
      startTime,
      endTime,
    }: IScheduleFilterRequest) {
      const betweenDates = {
        lte: new Date(endTime),
        gte: new Date(startTime),
      };
      return repository.query({
        OR: [
          { accountId: Number.isNaN(accountId) ? undefined : accountId },
          { agentId: Number.isNaN(agentId) ? undefined : agentId },
          { startTime: betweenDates },
          { endTime: betweenDates },
        ],
      });
    },
    async create(
      account: IUserBase,
      agent: IUserBase,
      request: Pick<IScheduleCreateRequest, "startTime" | "endTime">
    ) {
      return repository.create({
        accountId: account.id,
        agentId: agent.id,
        startTime: request.startTime,
        endTime: request.endTime,
      });
    },
    async update(
      scheduleId: string,
      account: IUserBase,
      agent: IUserBase,
      request: IScheduleUpdateRequest
    ) {
      return repository.update(scheduleId, {
        accountId: account.id,
        agentId: agent.id,
        startTime: request.startTime,
        endTime: request.endTime,
      });
    },
    async delete(scheduleId: string) {
      try {
        await repository.delete(scheduleId);
        return true;
      } catch {
        return false;
      }
    },
    async getById(scheduleId: string) {
      return repository.getById(scheduleId);
    },
  };
}
