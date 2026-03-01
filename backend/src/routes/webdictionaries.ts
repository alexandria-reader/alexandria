import express from 'express';
import { z } from 'zod';
import webdictionaries from '../services/webdictionaries';
import { Webdictionary } from '@alexandria/shared';
import { validate } from '../utils/middleware';

const webdictionariesRouter = express.Router();

const getBySourceTargetParams = z.object({
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
});

webdictionariesRouter.get(
  '/source/:sourceId/target/:targetId',
  validate({ params: getBySourceTargetParams }),
  async (_req, res) => {
    const cacheDuration = 60 * 60 * 24 * 7; // one week
    res.set('Cache-control', `public, max-age=${cacheDuration}`);

    const { sourceId, targetId } = res.locals.params;
    const webdictionaryList: Array<Webdictionary> =
      await webdictionaries.getBySourceTarget(sourceId, targetId);
    res.json(webdictionaryList);
  }
);

export default webdictionariesRouter;
