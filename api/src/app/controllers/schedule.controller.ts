import { Request, Response } from "express";
import {
  IScheduleModule,
  IScheduleController,
  IScheduleQueryRequest,
  IScheduleCreateRequest,
} from "@modules/schedule";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { responseError } from "@infra/http-utils";

export function scheduleController({
  service,
  userService,
}: IScheduleModule): IScheduleController {
  return {
    async filter(
      req: Request<IScheduleQueryRequest>,
      res: Response
    ): Promise<Response> {
      try {
        const validation = validationResult(req);
        if (!validation.isEmpty())
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ errors: validation.array() });

        const { startTime, accountId, agentId, endTime } = req.query;
        if (!(startTime instanceof Date && endTime instanceof Date))
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ error: "Invalid date!" });

        const result = await service.filter({
          endTime,
          startTime,
          accountId: Number(accountId?.toString()),
          agentId: Number(agentId?.toString()),
        });
        return res.status(StatusCodes.OK).send(result);
      } catch (error) {
        return responseError(res, error);
      }
    },
    async create(req: Request, res: Response): Promise<Response> {
      try {
        const validation = validationResult(req);

        if (!validation.isEmpty())
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ errors: validation.array() });

        const { startTime, endTime, account, agent } = req.body;
        const hasConflicting = await Promise.all([
          service.verifyConflictingAppointments(agent, startTime, endTime),
          service.verifyConflictingAppointments(account, startTime, endTime),
        ]);

        if (hasConflicting.includes(true))
          return res
            .status(StatusCodes.NOT_ACCEPTABLE)
            .send({ errors: { msg: "There are conflicting commitments!" } });

        const schedule = await service.create(account, agent, {
          startTime,
          endTime,
        });

        return res.status(StatusCodes.CREATED).send({ schedule });
      } catch (error) {
        return responseError(res, error);
      }
    },
    async update(req: Request, res: Response): Promise<Response> {
      try {
        const validation = validationResult(req);

        if (!validation.isEmpty())
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ errors: validation.array() });

        const { startTime, endTime, agent, schedule } = req.body;
        const account = await userService.getById(schedule.accountId);
        if (!account)
          return res
            .status(StatusCodes.NOT_ACCEPTABLE)
            .send({ error: "The account was not found!" });

        const hasConflicting = await Promise.all([
          service.verifyConflictingAppointments(agent, startTime, endTime),
          service.verifyConflictingAppointments(account, startTime, endTime),
        ]);

        if (hasConflicting.includes(true))
          return res
            .status(StatusCodes.NOT_ACCEPTABLE)
            .send({ error: "There are conflicting commitments!" });

        const result = await service.update(schedule?.id, account, agent, {
          startTime,
          endTime,
        });

        return res.status(StatusCodes.ACCEPTED).send({ schedule: result });
      } catch (error) {
        return responseError(res, error);
      }
    },
    async delete(req: Request, res: Response): Promise<Response> {
      try {
        const scheduleId: string = String(req?.params.scheduleId);
        if (!scheduleId) throw new Error("Invalid paramter!");
        await service.delete(scheduleId);
        return res.sendStatus(StatusCodes.ACCEPTED);
      } catch (error) {
        return responseError(res, error);
      }
    },
    async getById(req: Request, res: Response): Promise<Response> {
      try {
        const scheduleId: string = String(req?.params.scheduleId);
        if (!scheduleId) throw new Error("Invalid paramter!");

        const schedule = await service.getById(scheduleId);
        if (!schedule) return res.sendStatus(StatusCodes.NOT_FOUND);

        return res.status(StatusCodes.OK).send({ schedule });
      } catch (error) {
        return responseError(res, error);
      }
    },
  };
}
