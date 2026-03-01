import boom from '@hapi/boom';
import type { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import users from '../services/users';
import env from '../lib/env';

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
  value: JwtPayload | string
): value is JwtPayload {
  return (value as JwtPayload).id !== undefined;
};

export const getUserFromToken = async function (
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (!res.locals.token) throw boom.unauthorized('token missing or invalid');

  let decodedToken: string | JwtPayload;
  try {
    decodedToken = jwt.verify(res.locals.token, env.SECRET);
  } catch {
    throw boom.unauthorized('token missing or invalid');
  }

  if (!isJWTPayload(decodedToken) || !decodedToken.id) {
    throw boom.unauthorized('token missing or invalid');
  }

  const userById = await users.getById(decodedToken.id);
  res.locals.user = userById;

  next();
};
