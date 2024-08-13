import { Request, Response } from "express";
import {
  ITaskController,
  ITaskUpdateRequest,
  ITaskCreateRequest,
  ITaskModule,
  ITaskBase,
  ITaskQueryRequest,
} from "@modules/task";
import { validationResult } from "express-validator";
import { responseError } from "@infra/http-utils";
import { StatusCodes } from "http-status-codes";

export function taskController({
  service,
  userService,
}: ITaskModule): ITaskController {
  return {
    async filter(
      req: Request<{}, {}, {}, ITaskQueryRequest>,
      res: Response
    ): Promise<Response> {
      try {
        const validation = validationResult(req);
        if (!validation.isEmpty())
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ errors: validation.array() });

        const { startTime, type } = req.query;

        const result = await service.filter({ startTime, type });
        return res.status(StatusCodes.OK).send(result);
      } catch (error) {
        return responseError(res, error);
      }
    },
    async create(
      req: Request<{}, {}, ITaskCreateRequest>,
      res: Response
    ): Promise<Response> {
      try {
        const validation = validationResult(req);
        if (!validation.isEmpty())
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ errors: validation.array() });

        const { schedule, startTime, duration, type } = req.body;
        if (!schedule)
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ error: "Invalid Schedule!" });

        const account = await userService.getById(schedule.accountId);
        if (!account)
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ error: "Invalid Account!" });

        if (
          await service.verifyConflictingAppointments(
            schedule,
            startTime,
            duration
          )
        )
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ error: "There are conflicting commitments!" });

        if (
          !(await service.isTaskInScheduleRange(schedule, startTime, duration))
        )
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ error: "The Task is not in the schedule range!" });

        const task = await service.create(account, schedule, {
          startTime,
          duration,
          type,
        });

        return res.status(StatusCodes.CREATED).send({ task });
      } catch (error) {
        return responseError(res, error);
      }
    },
    async update(
      req: Request<{}, {}, ITaskUpdateRequest>,
      res: Response
    ): Promise<Response> {
      try {
        const validation = validationResult(req);
        if (!validation.isEmpty())
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ errors: validation.array() });

        const { schedule, startTime, duration, type, task } = req.body;
        if (!schedule || schedule.id !== task?.scheduleId)
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ error: "Invalid Schedule!" });

        const account = await userService.getById(schedule.accountId);
        if (!account)
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ error: "Invalid Account!" });

        if (
          await service.verifyConflictingAppointments(
            schedule,
            startTime,
            duration
          )
        )
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ error: "There are conflicting commitments!" });

        if (
          !(await service.isTaskInScheduleRange(schedule, startTime, duration))
        )
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ error: "The Task is not in the schedule range!" });

        const taskUpdated = await service.update(task.id, account, schedule, {
          startTime,
          duration,
          type,
        });
        return res.status(StatusCodes.ACCEPTED).send({ task: taskUpdated });
      } catch (error) {
        return responseError(res, error);
      }
    },
    async delete(req: Request, res: Response): Promise<Response> {
      try {
        const taskId: string = String(req?.params.taskId);
        if (!taskId) throw new Error("Invalid paramter!");
        await service.delete(taskId);
        return res.sendStatus(StatusCodes.ACCEPTED);
      } catch (error) {
        return responseError(res, error);
      }
    },
    async getById(req: Request, res: Response): Promise<Response> {
      try {
        const taskId: string = String(req?.params.taskId);
        const task = await service.getById(taskId);
        if (!task) return res.sendStatus(StatusCodes.NOT_FOUND);

        return res.status(StatusCodes.OK).send({ task });
      } catch (error) {
        return responseError(res, error);
      }
    },
  };
}
