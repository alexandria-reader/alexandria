import express from 'express';
import languages from '../services/languages';
import { Language } from '../types';

const languageRouter = express.Router();

languageRouter.get('/', async (_req, res) => {
  const cacheDuration = 60 * 60 * 24 * 7; // one week
  res.set('Cache-control', `public, max-age=${cacheDuration}`);

  const allLanguages: Array<Language> = await languages.getAll();
  res.send(allLanguages);
});

export default languageRouter;
