import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { IUserService, IUserBase } from "@modules/user";

export interface IScheduleRepository {
  query: (
    request: IScheduleQueryRequest,
    select?: IScheduleSelect
  ) => Promise<IScheduleResult[]>;
  create: (
    request: IScheduleCreateRequest,
    select?: IScheduleSelect
  ) => Promise<IScheduleBase>;
  update: (
    scheduleId: string,
    request: IScheduleUpdateRequest,
    select?: IScheduleSelect
  ) => Promise<IScheduleBase>;
  delete: (id: string, select?: IScheduleSelect) => Promise<void>;
  getById: (
    id: string,
    select?: IScheduleSelect
  ) => Promise<IScheduleBase | null>;
}
export interface IScheduleService {
  filter: (request: IScheduleFilterRequest) => Promise<IScheduleResult[]>;
  create: (
    account: IUserBase,
    agent: IUserBase,
    request: Pick<IScheduleCreateRequest, "startTime" | "endTime">
  ) => Promise<IScheduleResult>;
  update: (
    scheduleId: string,
    account: IUserBase,
    agent: IUserBase,
    request: IScheduleUpdateRequest
  ) => Promise<IScheduleResult>;
  delete: (scheduleId: string) => Promise<boolean>;
  getById: (scheduleId: string) => Promise<IScheduleResult | null>;
  verifyConflictingAppointments: (
    user: IUserBase,
    startTime: Date | string,
    endTime: Date | string
  ) => Promise<boolean>;
}
export interface IScheduleController {
  filter: (
    req: Request<IScheduleQueryRequest>,
    res: Response
  ) => Promise<Response>;
  create: (req: Request, res: Response) => Promise<Response>;
  update: (req: Request, res: Response) => Promise<Response>;
  delete: (req: Request, res: Response) => Promise<Response>;
  getById: (req: Request, res: Response) => Promise<Response>;
}
export interface IScheduleBase extends ScheduleBase {}
export interface IScheduleResult extends IScheduleBase {}
export interface IScheduleQueryRequest extends Prisma.ScheduleWhereInput {}
export interface IScheduleCreateRequest
  extends Prisma.ScheduleUncheckedCreateInput {}
export interface IScheduleUpdateRequest
  extends Prisma.ScheduleUncheckedUpdateInput {}
export interface IScheduleSelect extends Prisma.ScheduleSelect {}
export interface IScheduleFilterRequest {
  startTime: string | Date;
  endTime: string | Date;
  accountId?: number;
  agentId?: number;
}
const scheduleBase = Prisma.validator<Prisma.ScheduleDefaultArgs>()({});

type ScheduleBase = Prisma.ScheduleGetPayload<typeof scheduleBase>;

export interface IScheduleModule {
  repository: IScheduleRepository;
  service: IScheduleService;
  userService: IUserService;
}
