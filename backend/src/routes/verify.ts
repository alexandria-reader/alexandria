import boom from '@hapi/boom';
import express from 'express';
import users from '../services/users';
import { getUserFromToken } from '../utils/middleware';
import { User } from '../types';
import sendmail from '../utils/sendmail';

const verifyRouter = express.Router();

verifyRouter.get('/resend-email', getUserFromToken, async (_req, res) => {
  const { user } = res.locals;

  if (user.verified) {
    res.send('Email is already verified.');
    return;
  }

  const fullUser: User = (await users.getById(user.id, false)) as User;

  const emailSent = await sendmail.sendVerificationEmail(
    fullUser.verificationCode,
    user.email,
    user.username
  );

  if (!emailSent) {
    throw boom.badGateway(
      'Failed to send verification email. Please try again later.'
    );
  }

  res.send('Sent email again.');
});

verifyRouter.get('/:code/:token', async (req, res) => {
  const { code, token } = req.params;

  await users.verify(code, token);
  res.redirect('https://tryalexandria.com/verify');
});

export default verifyRouter;
