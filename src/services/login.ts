import boom from '@hapi/boom';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userData from '../data-access/users';
import { convertUserTypes, LoggedInUser, User, UserDB } from '../types';
import users from './users';

const verifyLoginDetails = async function (
  email: string,
  password: string
): Promise<UserDB> {
  const result = await userData.getByEmail(email);
  const user: UserDB | null = result.rowCount > 0 ? result.rows[0] : null;

  const passwordsMatch: boolean = user
    ? await bcrypt.compare(password, user.password_hash)
    : false;

  if (!(user && passwordsMatch)) {
    throw boom.unauthorized('invalid email or password');
  }

  return user;
};

const login = async function (
  email: string,
  password: string
): Promise<LoggedInUser> {
  const verifiedUser: User = convertUserTypes(
    await verifyLoginDetails(email, password)
  );
  const sanitizedUser = users.sanitizeUser(verifiedUser);
  const userForToken = {
    email: verifiedUser.email,
    id: verifiedUser.id,
  };

  const token = jwt.sign(
    userForToken,
    String(process.env.SECRET),
    { expiresIn: 60 * 60 * 24 * 7 } // token expires in one week
  );

  const loggedInUser: LoggedInUser = { ...sanitizedUser, token };

  return loggedInUser;
};

export default {
  login,
};
