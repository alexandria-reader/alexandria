import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import textsRouter from './routes/texts';
import translationsRouter from './routes/translations';
import usersRouter from './routes/users';
import wordsRouter from './routes/words';
import loginRouter from './routes/login';
import verifyRouter from './routes/verify';
import languageRouter from './routes/languages';
import webdictionariesRouter from './routes/webdictionaries';
import urlExtranctionRouter from './routes/url';

import dbQuery from './model/db-query';
import { extractToken, getUserFromToken } from './utils/middleware';

import { notFoundHandler, generalErrorHandler } from './utils/errorHandlers';
import { generateOpenAPIDocument } from './openapi/generator';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await dbQuery('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unhealthy' });
  }
});

const openApiDocument = generateOpenAPIDocument();
app.get('/api/docs/openapi.json', (_req, res) => {
  res.json(openApiDocument);
});
app.use(
  '/api/docs',
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument)
);

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
