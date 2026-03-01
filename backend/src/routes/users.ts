import boom from '@hapi/boom';
import express from 'express';
import {
  CreateUserRequestSchema,
  ConfirmPasswordRequestSchema,
  UpdateUserInfoRequestSchema,
  ChangePasswordRequestSchema,
  SetLanguagesRequestSchema,
} from '@alexandria/shared';
import users from '../services/users';
import { getUserFromToken, validate } from '../utils/middleware';

const userRouter = express.Router();

userRouter.get('/from-token', getUserFromToken, async (_req, res) => {
  const { user } = res.locals;
  const response = await users.getById(user.id);
  res.json(response);
});

userRouter.get('/', getUserFromToken, async (_req, res) => {
  const { user } = res.locals;
  const isAdmin = await users.isAdmin(+user.id);

  if (!isAdmin) {
    throw boom.forbidden('Admin access required.');
  }

  const response = await users.getAll();
  res.json(response);
});

userRouter.post(
  '/confirm',
  getUserFromToken,
  validate({ body: ConfirmPasswordRequestSchema }),
  async (req, res) => {
    const { user } = res.locals;
    const { password } = req.body;
    const response = await users.verifyPassword(user.id, password);
    if (response) {
      res.json({ match: 'true' });
    } else {
      res.json({ match: 'false' });
    }
  }
);

userRouter.post(
  '/',
  validate({ body: CreateUserRequestSchema }),
  async (req, res) => {
    const { username, password, email, knownLanguageId, learnLanguageId } =
      req.body;
    const newUser = await users.addNew(
      username,
      password,
      email,
      knownLanguageId,
      learnLanguageId
    );
    res.status(201).json(newUser);
  }
);

userRouter.put(
  '/update-info',
  getUserFromToken,
  validate({ body: UpdateUserInfoRequestSchema }),
  async (req, res) => {
    const { user } = res.locals;
    const { username, email } = req.body;

    const updatedUser = await users.updateUserInfo(user.id, username, email);
    return res.json(updatedUser);
  }
);

userRouter.put(
  '/change-password',
  getUserFromToken,
  validate({ body: ChangePasswordRequestSchema }),
  async (req, res) => {
    const { user } = res.locals;
    const { currentPassword, newPassword } = req.body;

    const response = await users.updatePassword(
      user.id,
      currentPassword,
      newPassword
    );
    res.json(response);
  }
);

userRouter.put(
  '/set-languages',
  getUserFromToken,
  validate({ body: SetLanguagesRequestSchema }),
  async (req, res) => {
    const { user } = res.locals;
    const { knownLanguageId, learnLanguageId } = req.body;

    const updatedUser = await users.setUserLanguages(
      knownLanguageId,
      learnLanguageId,
      user.id
    );
    return res.json(updatedUser);
  }
);

userRouter.delete('/', getUserFromToken, async (_req, res) => {
  const { user } = res.locals;
  await users.remove(user.id);
  res.status(204).send();
});

export default userRouter;
