import express from 'express';
import login from '../services/login';
import { LoggedInUser } from '../types';

const loginRouter = express.Router();

export default loginRouter.post('/', async (req, res) => {
  const { email, password } = req.body;

  const loggedInUser: LoggedInUser = await login.login(email, password);

  res.status(200).json(loggedInUser);
});
