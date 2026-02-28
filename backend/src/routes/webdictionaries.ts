import express from 'express';
import webdictionaries from '../services/webdictionaries';
import { Webdictionary } from '../types';

const webdictionariesRouter = express.Router();

webdictionariesRouter.get(
  '/source/:sourceId/target/:targetId',
  async (req, res) => {
    const cacheDuration = 60 * 60 * 24 * 7; // one week
    res.set('Cache-control', `public, max-age=${cacheDuration}`);

    const { sourceId, targetId } = req.params;
    const webdictionaryList: Array<Webdictionary> =
      await webdictionaries.getBySourceTarget(sourceId, targetId);
    res.json(webdictionaryList);
  }
);

export default webdictionariesRouter;
