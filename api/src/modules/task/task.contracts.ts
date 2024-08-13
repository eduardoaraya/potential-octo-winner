import { Prisma, $Enums } from "@prisma/client";
import { Request, Response } from "express";
import { IUserService, IUserBase } from "@modules/user";
import { IScheduleService, IScheduleBase } from "@modules/schedule";

export interface ITaskRepository {
  query: (request: ITaskQuery, select?: ITaskSelect) => Promise<ITaskResult[]>;
  create: (request: ITaskCreate, select?: ITaskSelect) => Promise<ITaskBase>;
  update: (
    id: string,
    request: ITaskUpdate,
    select?: ITaskSelect
  ) => Promise<ITaskBase>;
  delete: (taskId: string) => Promise<void>;
  getById: (taskId: string, select?: ITaskSelect) => Promise<ITaskBase | null>;
}
export interface ITaskService {
  verifyConflictingAppointments: (
    schedule: IScheduleBase,
    startTime: string | Date,
    duration: number
  ) => Promise<boolean>;
  isTaskInScheduleRange: (
    schedule: IScheduleBase,
    startTime: string | Date,
    duration: number
  ) => Promise<boolean>;
  filter: (request: ITaskQueryRequest) => Promise<ITaskResult[]>;
  create: (
    user: IUserBase,
    schedule: IScheduleBase,
    request: ITaskCreateRequest
  ) => Promise<ITaskResult>;
  update: (
    taskId: string,
    account: IUserBase,
    schedule: IScheduleBase,
    request: ITaskUpdateRequest
  ) => Promise<ITaskBase>;
  delete: (taskId: string) => Promise<boolean>;
  getById: (
    taskId: string,
    select?: ITaskSelect
  ) => Promise<ITaskResult | null>;
}
export interface ITaskController {
  filter: (
    req: Request<{}, {}, {}, ITaskQueryRequest>,
    res: Response
  ) => Promise<Response>;
  create: (req: Request, res: Response) => Promise<Response>;
  update: (req: Request, res: Response) => Promise<Response>;
  delete: (req: Request, res: Response) => Promise<Response>;
  getById: (req: Request, res: Response) => Promise<Response>;
}
export interface ITaskBase extends TaskBase {}
export interface ITaskResult extends ITaskBase {}
export interface ITaskQueryRequest
  extends Pick<ITaskBase, "startTime" | "type"> {}
export interface ITaskCreateRequest
  extends Pick<ITaskCreate, "startTime" | "duration" | "type"> {
  schedule?: IScheduleBase;
}
export interface ITaskUpdateRequest
  extends Pick<ITaskCreate, "startTime" | "duration" | "type"> {
  schedule?: IScheduleBase;
  task?: ITaskBase;
}

export interface ITaskUpdate extends Prisma.TaskUncheckedUpdateInput {}
export interface ITaskQuery extends Prisma.TaskWhereInput {}
export interface ITaskSelect extends Prisma.TaskSelectScalar {}
export interface ITaskCreate extends Prisma.TaskUncheckedCreateInput {}

const taskBase = Prisma.validator<Prisma.TaskDefaultArgs>()({});

type TaskBase = Prisma.TaskGetPayload<typeof taskBase>;

export const TaskTypesConst = $Enums.TaskType;

export interface ITaskModule {
  service: ITaskService;
  repository: ITaskRepository;
  userService: IUserService;
  scheduleService: IScheduleService;
}
