/* eslint-disable max-len */
import express from 'express';
import users from '../services/users';
import { getUserFromToken } from '../utils/middleware';
import { SanitizedUser, User } from '../types';
import sendmail from '../utils/sendmail';

const verifyRouter = express.Router();

verifyRouter.get('/resend-email', getUserFromToken, async (_req, res) => {
  const { user } = res.locals;
  const fullUser: User = (await users.getById(user.id, false)) as User;

  if (!user.verified) {
    await sendmail.sendVerificationEmail(
      fullUser.verificationCode,
      user.email,
      user.username
    );
  }

  res.send('Sent email again.');
});

verifyRouter.get('/:code/:token', async (req, res) => {
  const { code, token } = req.params;

  const verifiedUser: SanitizedUser = await users.verify(code, token);

  if (verifiedUser) res.redirect('https://tryalexandria.com/verify');

  res.status(404).send();
});

export default verifyRouter;
