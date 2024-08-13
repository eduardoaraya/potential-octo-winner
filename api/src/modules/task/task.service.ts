import { IUserBase } from "@modules/user";
import { IScheduleBase } from "@modules/schedule";
import {
  ITaskRepository,
  ITaskCreateRequest,
  ITaskUpdateRequest,
  ITaskQueryRequest,
  ITaskService,
  ITaskQuery,
  ITaskSelect,
} from "./task.contracts";

export function taskService(repository: ITaskRepository): ITaskService {
  return {
    async verifyConflictingAppointments(
      schedule: IScheduleBase,
      startTime: string | Date,
      duration: number
    ): Promise<boolean> {
      const endTime = new Date(new Date(startTime).setSeconds(duration));
      const result = await repository.query(
        { scheduleId: schedule.id },
        { startTime: true, duration: true }
      );
      if (!result.length) return false;

      return (
        result
          .map((task) => ({
            startTime: task.startTime,
            endTime: new Date(new Date(task.startTime).setSeconds(duration)),
          }))
          .filter(
            (task) =>
              (startTime >= task.startTime && startTime <= task.endTime) ||
              (endTime > task.startTime && endTime < task.endTime)
          ).length > 0
      );
    },
    async isTaskInScheduleRange(
      schedule: IScheduleBase,
      startTime: string | Date,
      duration: number
    ): Promise<boolean> {
      const taskEndTime = new Date(new Date(startTime).setSeconds(duration));
      const [scheduleStartTime, scheduleEndTime] = [
        new Date(schedule.startTime),
        new Date(schedule.endTime),
      ];
      return (
        taskEndTime.getTime() >= scheduleStartTime.getTime() &&
        taskEndTime.getTime() <= scheduleEndTime.getTime()
      );
    },
    async filter(request: ITaskQueryRequest) {
      const query: ITaskQuery = request.type ? { type: request.type } : {};

      if (request.startTime) {
        const date = new Date(request.startTime);
        query.startTime = {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0),
          lte: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            23,
            59,
            59
          ),
        };
      }

      return repository.query(query);
    },
    async create(
      account: IUserBase,
      schedule: IScheduleBase,
      request: ITaskCreateRequest
    ) {
      return repository.create({
        accountId: account.id,
        scheduleId: schedule.id,
        startTime: request.startTime,
        duration: Number(request.duration),
        type: request.type,
      });
    },
    async update(
      taskId: string,
      account: IUserBase,
      schedule: IScheduleBase,
      request: ITaskUpdateRequest
    ) {
      return repository.update(taskId, {
        accountId: account.id,
        scheduleId: schedule.id,
        startTime: request.startTime,
        duration: Number(request.duration),
        type: request.type,
      });
    },
    async delete(taskId: string) {
      try {
        await repository.delete(taskId);
        return true;
      } catch {
        return false;
      }
    },
    async getById(taskId: string, select?: ITaskSelect) {
      return repository.getById(taskId, select);
    },
  };
}
