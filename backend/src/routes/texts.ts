import boom from '@hapi/boom';
import express from 'express';
import { z } from 'zod';
import texts from '../services/texts';
import readingProgress from '../services/reading-progress';
import users from '../services/users';
import {
  TextPagination,
  Text,
  CreateTextRequestSchema,
  UpdateTextRequestSchema,
  SaveProgressRequestSchema,
} from '@alexandria/shared';
import { validate } from '../utils/middleware';

const router: express.Router = express.Router();

const idParams = z.object({ id: z.coerce.number().int().positive() });
const paginationParams = z.object({
  languageId: z.string().min(1),
  page: z.string().min(1),
});

router.get(
  '/language/:languageId/:page/',
  validate({ params: paginationParams }),
  async (_req, res): Promise<void> => {
    const { user, params } = res.locals;
    const textPagination: TextPagination = await texts.getByUserAndLanguage(
      Number(user.id),
      params.languageId,
      params.page
    );
    res.json(textPagination);
  }
);

router.get(
  '/:id',
  validate({ params: idParams }),
  async (_req, res): Promise<void> => {
    const { user, params } = res.locals;

    const textById: Text = await texts.getById(params.id, Number(user.id));

    if (textById.userId !== user.id) {
      throw boom.forbidden('You do not have access to this text.');
    }

    res.json(textById);
  }
);

router.get('/', async (_req, res): Promise<void> => {
  const { user } = res.locals;
  const isAdmin = await users.isAdmin(Number(user.id));

  if (!isAdmin) {
    throw boom.forbidden('Admin access required.');
  }

  const allTexts: Array<Text> = await texts.getAll();
  res.json(allTexts);
});

router.post(
  '/',
  validate({ body: CreateTextRequestSchema }),
  async (req, res): Promise<void> => {
    const { user } = res.locals;

    if (!user.verified) {
      throw boom.forbidden('You must verify your email before adding texts.');
    }

    const textData: Text = req.body;
    textData.userId = user.id;

    const text: Text = await texts.addNew(textData);
    res.status(201).json(text);
  }
);

router.put(
  '/:id/progress',
  validate({ params: idParams, body: SaveProgressRequestSchema }),
  async (req, res): Promise<void> => {
    const { user, params } = res.locals;
    const { pageStartWordIndex } = req.body;

    const text: Text = await texts.getById(params.id, Number(user.id));

    if (text.userId !== user.id) {
      throw boom.forbidden('You do not have access to this text.');
    }

    const progress = await readingProgress.save(
      Number(user.id),
      params.id,
      pageStartWordIndex
    );
    res.json(progress);
  }
);

router.put(
  '/:id',
  validate({ params: idParams, body: UpdateTextRequestSchema }),
  async (req, res): Promise<void> => {
    const { user, params } = res.locals;

    const existing: Text = await texts.getById(params.id, Number(user.id));
    if (existing.userId !== user.id) {
      throw boom.forbidden('You do not have access to this text.');
    }

    const updatedText: Text = await texts.update({
      ...existing,
      ...req.body,
      id: params.id,
      userId: user.id,
    });
    res.json(updatedText);
  }
);

router.delete(
  '/:id',
  validate({ params: idParams }),
  async (_req, res): Promise<void> => {
    const { user, params } = res.locals;

    const toBeDeleted: Text = await texts.getById(params.id, Number(user.id));

    if (toBeDeleted.userId !== user.id) {
      throw boom.forbidden('You do not have access to this text.');
    }

    await texts.remove(params.id);
    res.status(204).send();
  }
);

export default router;
