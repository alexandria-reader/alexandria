import boom from '@hapi/boom';
import { extract } from 'article-parser';
import express from 'express';
import { ExtractUrlRequestSchema } from '@alexandria/shared';
import { validate } from '../utils/middleware';

const router: express.Router = express.Router();

router.post(
  '/',
  validate({ body: ExtractUrlRequestSchema }),
  async (req, res) => {
    const { url } = req.body;
    let responded = false;

    const timer = setTimeout(() => {
      responded = true;
      res.status(204).send();
    }, 2000);

    try {
      const article = await extract(url);
      clearTimeout(timer);
      if (!responded) {
        res.json(article);
      }
    } catch (_error) {
      clearTimeout(timer);
      if (!responded) {
        throw boom.badRequest('Could not extract article from URL.');
      }
    }
  }
);

export default router;
