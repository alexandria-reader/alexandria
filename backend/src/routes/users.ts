/* eslint-disable max-len */
import express from 'express';
import users from '../services/users';
import { getUserFromToken } from '../utils/middleware';

const userRouter = express.Router();

userRouter.get('/from-token', getUserFromToken, async (_req, res) => {
  const { user } = res.locals;
  const response = await users.getById(user.id);
  res.json(response);
});

userRouter.get('/', getUserFromToken, async (_req, res) => {
  const { user } = res.locals;
  const isAdmin = await users.isAdmin(Number(user.id));
  if (isAdmin) {
    const response = await users.getAll();
    res.json(response);
  }
  res.status(404).send();
});

userRouter.post('/confirm', getUserFromToken, async (req, res) => {
  const { user } = res.locals;
  const { password } = req.body;
  const response = await users.verifyPassword(user.id, password);
  if (response) {
    res.json({ match: 'true' });
  } else {
    res.json({ match: 'false' });
  }
});

userRouter.post('/', async (req, res) => {
  const { username, password, email, knownLanguageId, learnLanguageId } =
    req.body;
  // TODO: investigate issue with incorrect credentials for sendgrid causing a 500 error
  const newUser = await users.addNew(
    username,
    password,
    email,
    knownLanguageId,
    learnLanguageId
  );
  res.status(201).json(newUser);
});

userRouter.put('/update-info', getUserFromToken, async (req, res) => {
  const { user } = res.locals;
  const { userName, email } = req.body;

  const updatedUser = await users.updateUserInfo(user.id, userName, email);
  return res.json(updatedUser);
});

userRouter.put('/change-password', getUserFromToken, async (req, res) => {
  const { user } = res.locals;
  const { currentPassword, newPassword } = req.body;

  const response = await users.updatePassword(
    user.id,
    currentPassword,
    newPassword
  );
  res.json(response);
});

userRouter.put('/set-languages', getUserFromToken, async (req, res) => {
  const { user } = res.locals;
  const { knownLanguageId, learnLanguageId } = req.body;

  const updatedUser = await users.setUserLanguages(
    knownLanguageId,
    learnLanguageId,
    user.id
  );
  return res.json(updatedUser);
});

userRouter.delete('/', getUserFromToken, async (_req, res) => {
  const { user } = res.locals;
  await users.remove(user.id);
  res.status(204).send();
});

export default userRouter;
