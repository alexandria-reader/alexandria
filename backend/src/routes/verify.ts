import boom from '@hapi/boom';
import express from 'express';
import { z } from 'zod';
import users from '../services/users';
import { getUserFromToken, validate } from '../utils/middleware';
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

const verifyParams = z.object({
  code: z.string().min(1),
  token: z.string().min(1),
});

verifyRouter.get(
  '/:code/:token',
  validate({ params: verifyParams }),
  async (_req, res) => {
    const { params } = res.locals;

    await users.verify(params.code, params.token);
    res.redirect('https://tryalexandria.com/verify');
  }
);

export default verifyRouter;
