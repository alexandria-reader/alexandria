import boom from '@hapi/boom';
import type { Request, Response, NextFunction } from 'express';

export const notFoundHandler = function (
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  next(boom.notFound('The requested resource does not exist.'));
};

export const generalErrorHandler = function (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const {
    output: { payload: error, statusCode },
  } = boom.boomify(err);
  res.status(statusCode).json({ error });
};
