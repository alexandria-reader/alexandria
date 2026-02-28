/* eslint-disable max-len */
import boom from '@hapi/boom';
import type { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import users from '../services/users';

export const extractToken = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.get('authorization');

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    res.locals.token = authorization.substring(7);
  }

  next();
};

const isJWTPayload = function (
  value: JwtPayload | String
): value is JwtPayload {
  return (value as JwtPayload).id !== undefined;
};

export const getUserFromToken = async function (
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (!res.locals.token) throw boom.unauthorized('token missing or invalid');

  const decodedToken = jwt.verify(
    res.locals.token,
    process.env.SECRET as Secret
  );

  if (isJWTPayload(decodedToken)) {
    if (!decodedToken.id) throw boom.unauthorized('token invalid or missing');

    const userById = await users.getById(decodedToken.id);
    res.locals.user = userById;
  }

  next();
};
