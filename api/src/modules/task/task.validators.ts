import { ExpressValidator } from "express-validator";
import { toSchedule, validateSchedule } from "@modules/schedule";
import { ITaskModule, TaskTypesConst, ITaskService } from "./task.contracts";

export const toTask = (service: ITaskService) => async (value: string) => {
  if (!value) return false;
  return await service.getById(value);
};

export const validateTask =
  (service: ITaskService) => async (value: string) => {
    if (!value) return false;
    return Boolean(await service.getById(value));
  };

export const taskExpressValidator = (module: ITaskModule) =>
  new ExpressValidator(
    {
      validateSchedule: validateSchedule(module.scheduleService),
      validateTask: validateTask(module.service),
    },
    {
      toSchedule: toSchedule(module.scheduleService),
      toTask: toTask(module.service),
    },
  );

export const createSchema = (module: ITaskModule) => {
  return taskExpressValidator(module).checkSchema(
    {
      schedule: {
        notEmpty: true,
        isString: true,
        validateSchedule: true,
        toSchedule: true,
      },
      startTime: {
        notEmpty: true,
        isISO8601: true,
        toDate: true,
      },
      duration: {
        isInt: true,
        notEmpty: true,
      },
      type: {
        isIn: {
          options: [[TaskTypesConst.work, TaskTypesConst.break]],
        },
      },
    },
    ["body"],
  );
};

export const updateSchema = (module: ITaskModule) => {
  return taskExpressValidator(module).checkSchema(
    {
      task: {
        notEmpty: true,
        isString: true,
        validateTask: true,
        toTask: true,
      },
      schedule: {
        notEmpty: true,
        isString: true,
        validateSchedule: true,
        toSchedule: true,
      },
      startTime: {
        notEmpty: true,
        isISO8601: true,
        toDate: true,
      },
      duration: {
        isInt: true,
        notEmpty: true,
      },
      type: {
        isIn: {
          options: [[TaskTypesConst.work, TaskTypesConst.break]],
        },
      },
    },
    ["body"],
  );
};

export const searchSchema = () => {
  return new ExpressValidator({}).checkSchema(
    {
      startTime: {
        optional: true,
        isDate: true,
        toDate: true,
      },
      type: {
        optional: true,
        isIn: {
          options: [[TaskTypesConst.work, TaskTypesConst.break]],
        },
      },
    },
    ["query"],
  );
};
