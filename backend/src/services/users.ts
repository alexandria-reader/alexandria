/* eslint-disable max-len */
import boom from '@hapi/boom';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt, { Secret } from 'jsonwebtoken';
import { QueryResult } from 'pg';

import sendmail from '../utils/sendmail';
import userData from '../data-access/users';
import textData from '../data-access/texts';
import { SanitizedUser, User, convertUserTypes, UserDB } from '../types';

const sanitizeUser = function (user: User): SanitizedUser {
  const sanitizedUser: SanitizedUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    knownLanguageId: user.knownLanguageId,
    learnLanguageId: user.learnLanguageId,
    verified: user.verified,
  };

  return sanitizedUser;
};

const isAdmin = async function (userId: Number): Promise<boolean> {
  const result: QueryResult = await userData.isAdmin(userId);
  if (result.rowCount === 0) return false;
  return true;
};

const getAll = async function (): Promise<Array<SanitizedUser>> {
  const result: QueryResult = await userData.getAll();
  const allUsers = result.rows.map((dbItem: UserDB) =>
    convertUserTypes(dbItem)
  );
  return allUsers;
};

const getById = async function (
  userId: string,
  sanitize: boolean = true
): Promise<SanitizedUser | User> {
  const result: QueryResult = await userData.getById(userId);

  if (result.rowCount === 0)
    throw boom.notFound('cannot find user with this id');

  const foundUser: User = convertUserTypes(result.rows[0]);
  if (sanitize) return sanitizeUser(foundUser);
  return foundUser;
};

const verifyPassword = async function (
  userId: string,
  password: string
): Promise<boolean> {
  const result = await userData.getById(userId);
  const user = result.rows[0];
  const passwordsMatch = await bcrypt.compare(password, user.password_hash);
  return passwordsMatch;
};

const addNew = async function (
  username: string,
  password: string,
  email: string,
  knownLanguageId: string,
  learnLanguageId: string
): Promise<SanitizedUser> {
  const emailExists = await userData.getByEmail(email);
  if (emailExists.rowCount > 0)
    throw boom.notAcceptable('Email already in use.');
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const verificationCode = uuidv4();
  const result = await userData.addNew(
    username,
    passwordHash,
    email,
    knownLanguageId,
    learnLanguageId,
    verificationCode
  );
  const newUser: User = convertUserTypes(result.rows[0]);
  if (newUser.id) {
    await textData.addMatchGirlToUser(newUser.id, learnLanguageId);
  }
  if (process.env.NODE_ENV !== 'test')
    await sendmail.sendVerificationEmail(verificationCode, email, username);
  return sanitizeUser(newUser);
};

const updateUserInfo = async function (
  userId: string,
  userName: string,
  email: string
): Promise<SanitizedUser> {
  const result = await userData.updateUserInfo(userId, userName, email);
  if (result.rowCount === 0) throw boom.notAcceptable('Something went wrong');
  const updatedUser: User = convertUserTypes(result.rows[0]);
  return sanitizeUser(updatedUser);
};

const updatePassword = async function (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  if (!currentPassword) {
    throw boom.notAcceptable('You must submit your current password.');
  } else if (!newPassword) {
    throw boom.notAcceptable('You must submit a new password.');
  }

  const passwordsMatch = await verifyPassword(userId, currentPassword);

  if (passwordsMatch) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    const result = await userData.updatePassword(userId, passwordHash);

    if (result.rowCount === 1) {
      return { message: 'Your password has been updated' };
    }
  }

  throw boom.notAcceptable('Incorrect password.');
};

const setUserLanguages = async function (
  knownLanguageId: string,
  learnLanguageId: string,
  userId: string
): Promise<SanitizedUser> {
  const result = await userData.setUserLanguages(
    knownLanguageId,
    learnLanguageId,
    userId
  );

  if (result.rowCount === 0) throw boom.notAcceptable('Something went wrong');
  const updatedUser: User = convertUserTypes(result.rows[0]);
  return sanitizeUser(updatedUser);
};

const remove = async function (
  userId: string
): Promise<SanitizedUser | undefined> {
  const result = await userData.remove(userId);

  if (result.rowCount > 0) {
    const deletedUser: User = result.rows[0];
    return sanitizeUser(deletedUser);
  }

  throw boom.unauthorized('Something went wrong');
};

const verify = async function (
  code: string,
  token: string
): Promise<SanitizedUser> {
  const decodedToken = jwt.verify(token, process.env.SECRET as Secret);

  if (typeof decodedToken === 'string') {
    let result: QueryResult = await userData.getByEmail(decodedToken);
    if (result.rowCount === 0)
      throw boom.notFound('cannot find user with this email');

    const foundUser: User = convertUserTypes(result.rows[0]);
    if (foundUser.verificationCode !== code)
      throw boom.unauthorized('invalid verification code');

    result = await userData.verify(Number(foundUser.id));
    if (result.rowCount === 0) throw boom.notFound('cannot verify user');

    const verifiedUser = convertUserTypes(result.rows[0]);
    return sanitizeUser(verifiedUser);
  }

  throw boom.unauthorized('invalid token');
};

export default {
  sanitizeUser,
  isAdmin,
  getAll,
  addNew,
  updatePassword,
  remove,
  getById,
  verifyPassword,
  verify,
  setUserLanguages,
  updateUserInfo,
};
