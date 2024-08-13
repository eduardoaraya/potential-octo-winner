import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

export interface IUserRepository {
  query: (
    request: IUserQueryRequest,
    select?: IUserSelect
  ) => Promise<IUserResult[]>;
  create: (
    request: IUserCreateRequest,
    select?: IUserSelect
  ) => Promise<IUserResult>;
  update: (
    id: number,
    request: IUserUpdateRequest,
    select?: IUserSelect
  ) => Promise<IUserResult>;
  delete: (userId: number) => Promise<void>;
  getById: (userId: number, select?: IUserSelect) => Promise<IUserBase | null>;
}
export interface IUserService {
  filter: (
    request: Pick<IUserQueryRequest, "email" | "name">,
    select?: IUserSelect
  ) => Promise<IUserResult[]>;
  create: (request: IUserCreateRequest) => Promise<IUserBase>;
  update: (userId: number, request: IUserUpdateRequest) => Promise<IUserResult>;
  delete: (userId: number) => Promise<boolean>;
  getById: (
    userId: number,
    select?: IUserSelect
  ) => Promise<IUserResult | null>;
}
export interface IUserController {
  filter: (req: Request<IUserQueryRequest>, res: Response) => Promise<Response>;
  create: (
    req: Request<{}, {}, IUserCreateRequest>,
    res: Response
  ) => Promise<Response>;
  update: (
    req: Request<IUserUpdateRequest>,
    res: Response
  ) => Promise<Response>;
  delete: (req: Request, res: Response) => Promise<Response>;
  getById: (req: Request, res: Response) => Promise<Response>;
}
export interface IUserBase extends UserBase {}
export interface IUserResult extends IUserBase {}
export interface IUserQueryRequest extends Prisma.UserWhereInput {}
export interface IUserCreateRequest extends Prisma.UserCreateInput {}
export interface IUserUpdateRequest extends Prisma.UserUpdateInput {}
export interface IUserSelect extends Prisma.UserSelectScalar {}
export interface IUserIncludes extends Prisma.UserInclude {}

const userBase = Prisma.validator<Prisma.UserDefaultArgs>()({});

export type UserBase = Prisma.UserGetPayload<typeof userBase>;

export interface IUserModule {
  service: IUserService;
  repository: IUserRepository;
}
