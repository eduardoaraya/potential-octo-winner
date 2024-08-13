import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  IUserModule,
  IUserController,
  IUserQueryRequest,
  IUserUpdateRequest,
  IUserCreateRequest,
} from "@modules/user";
import { validationResult } from "express-validator";
import { responseError } from "@infra/http-utils";

export function userController({ service }: IUserModule): IUserController {
  return {
    async filter(
      req: Request<IUserQueryRequest>,
      res: Response
    ): Promise<Response> {
      try {
        const validation = validationResult(req);
        if (!validation.isEmpty())
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ errors: validation.array() });

        const { email, name } = req.query;
        const result = await service.filter({
          email: email?.toString(),
          name: name?.toString(),
        });

        return res.status(StatusCodes.OK).send(result);
      } catch (error) {
        return responseError(res, error);
      }
    },
    async create(
      req: Request<{}, {}, IUserCreateRequest>,
      res: Response
    ): Promise<Response> {
      try {
        const validation = validationResult(req);
        if (!validation.isEmpty())
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ errors: validation.array() });

        const { email, name } = req.body;
        const user = await service.create({ email, name });
        return res.status(StatusCodes.CREATED).send({ user });
      } catch (error) {
        return responseError(res, error);
      }
    },
    async update(
      req: Request<IUserUpdateRequest>,
      res: Response
    ): Promise<Response> {
      try {
        const validation = validationResult(req);
        if (!validation.isEmpty())
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ errors: validation.array() });

        const { email, name } = req.body;

        const result = await service.update(req.body?.userId, { email, name });
        return res.status(StatusCodes.ACCEPTED).send({ user: result });
      } catch (error) {
        return responseError(res, error);
      }
    },
    async delete(req: Request, res: Response): Promise<Response> {
      try {
        const userId: number = Number(req?.params?.userId);
        if (!userId || userId >= Number.MAX_SAFE_INTEGER)
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ error: "Invalid userId!" });

        const deleted = await service.delete(userId);
        if (!deleted) return res.sendStatus(StatusCodes.NOT_ACCEPTABLE);

        await service.delete(userId);
        return res.sendStatus(StatusCodes.ACCEPTED);
      } catch (error) {
        return responseError(res, error);
      }
    },
    async getById(req: Request, res: Response): Promise<Response> {
      try {
        const userId: number = Number(req?.params?.userId);
        if (!userId || userId >= Number.MAX_SAFE_INTEGER)
          return res
            .status(StatusCodes.PRECONDITION_FAILED)
            .send({ error: "Invalid userId!" });

        const user = await service.getById(userId);
        if (!user) return res.sendStatus(StatusCodes.NOT_FOUND);

        return res.status(StatusCodes.OK).send({ user });
      } catch (error) {
        return responseError(res, error);
      }
    },
  };
}
