import { Response } from "express";
import { ValidationError } from "express-validator";
import { isProd } from "./environment";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { errorLog } from "./log";

export type ResponseError =
  | {
      errors?: ValidationError;
    }
  | { error?: string };

export const responseError = (
  res: Response,
  error: unknown | ValidationError | Error
) => {
  let errorResponse: ResponseError = {};
  errorLog(error);
  if (Array.isArray(error))
    errorResponse = { errors: error as unknown as ValidationError };
  else if (error instanceof Error && !isProd())
    errorResponse = { error: error?.message };
  else errorResponse = { error: ReasonPhrases.INTERNAL_SERVER_ERROR };

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(errorResponse);
};
