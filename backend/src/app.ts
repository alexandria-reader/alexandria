import express from 'express';
import cors from 'cors';
import 'express-async-errors';

import textsRouter from './routes/texts';
import translationsRouter from './routes/translations';
import usersRouter from './routes/users';
import wordsRouter from './routes/words';
import loginRouter from './routes/login';
import verifyRouter from './routes/verify';
import languageRouter from './routes/languages';
import webdictionariesRouter from './routes/webdictionaries';
import urlExtranctionRouter from './routes/url';

import { extractToken, getUserFromToken } from './utils/middleware';

import { notFoundHandler, generalErrorHandler } from './utils/errorHandlers';

const app = express();
app.use(cors());
app.use(express.json());

app.use(extractToken);

app.get('/', (_req, res) => {
  res.redirect('https://tryalexandria.com');
});

app.use('/verify', verifyRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/languages', languageRouter);
app.use('/api/webdictionaries', webdictionariesRouter);
app.use('/api/texts', getUserFromToken, textsRouter);
app.use('/api/translations', getUserFromToken, translationsRouter);
app.use('/api/words', getUserFromToken, wordsRouter);
app.use('/api/url', getUserFromToken, urlExtranctionRouter);

app.use([notFoundHandler, generalErrorHandler]);

export default app;
