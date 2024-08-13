import { ExpressValidator, Meta } from "express-validator";
import { IUserBase, validateUser, toUser } from "@modules/user";
import { IScheduleService, IScheduleModule } from "./schedule.contracts";

export const isEndtimeBeforeStarttime = (value: string, { req }: Meta) => {
  const [startTime, endTime] = [new Date(req.body.startTime), new Date(value)];
  return startTime.getTime() <= endTime.getTime();
};

export const validateAgentDifFromAccount = (
  value: IUserBase,
  { req }: Meta,
) => {
  return !(value?.id === req?.body?.account?.id);
};

export const toSchedule =
  (service: IScheduleService) => async (value: string) => {
    if (!value) return false;
    return await service.getById(value);
  };

export const validateSchedule =
  (service: IScheduleService) => async (value: string) => {
    if (!value) return false;
    return Boolean(await service.getById(value));
  };

export const expressExpressValidator = (module: IScheduleModule) =>
  new ExpressValidator(
    {
      validateUser: validateUser(module.userService),
      isEndtimeBeforeStarttime,
      validateAgentDifFromAccount,
      validateSchedule: validateSchedule(module.service),
    },
    {
      toUser: toUser(module.userService),
      toSchedule: toSchedule(module.service),
    },
  );

export const createSchema = (module: IScheduleModule) => {
  return expressExpressValidator(module).checkSchema(
    {
      account: {
        notEmpty: true,
        isInt: true,
        toInt: true,
        validateUser: true,
        toUser: true,
      },
      agent: {
        notEmpty: true,
        isInt: true,
        toInt: true,
        validateUser: true,
        toUser: true,
        validateAgentDifFromAccount: true,
      },
      startTime: {
        notEmpty: true,
        isISO8601: true,
        toDate: true,
      },
      endTime: {
        notEmpty: true,
        isISO8601: true,
        toDate: true,
        isEndtimeBeforeStarttime: true,
      },
    },
    ["body"],
  );
};

export const updateSchema = (module: IScheduleModule) => {
  return expressExpressValidator(module).checkSchema(
    {
      schedule: {
        isString: true,
        notEmpty: true,
        validateSchedule: true,
        toSchedule: true,
      },
      agent: {
        notEmpty: true,
        isInt: true,
        toInt: true,
        validateUser: true,
        toUser: true,
        validateAgentDifFromAccount: true,
      },
      startTime: {
        notEmpty: true,
        isISO8601: true,
        toDate: true,
      },
      endTime: {
        notEmpty: true,
        isISO8601: true,
        toDate: true,
        isEndtimeBeforeStarttime: true,
      },
    },
    ["body"],
  );
};

export const searchSchema = () => {
  return new ExpressValidator({}).checkSchema(
    {
      account: {
        notEmpty: true,
        isInt: true,
        toInt: true,
        optional: true,
      },
      agent: {
        notEmpty: true,
        isInt: true,
        optional: true,
      },
      startTime: {
        notEmpty: true,
        toDate: true,
      },
      endTime: {
        notEmpty: true,
        toDate: true,
      },
    },
    ["query"],
  );
};
