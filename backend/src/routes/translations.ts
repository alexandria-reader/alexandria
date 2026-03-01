import express from 'express';
import { z } from 'zod';
import translations from '../services/translations';
import {
  Translation,
  AddTranslationRequestSchema,
  UpdateTranslationRequestSchema,
} from '@alexandria/shared';
import { validate } from '../utils/middleware';

const router = express.Router();

router.post(
  '/',
  validate({ body: AddTranslationRequestSchema }),
  async (req, res) => {
    const { user } = res.locals;
    const { wordId, translation, targetLanguageId, context } = req.body;

    const newTranslation: Translation = await translations.add(
      wordId,
      translation,
      targetLanguageId
    );

    if (newTranslation.id) {
      await translations.addToUsersTranslations(
        Number(user.id),
        newTranslation.id,
        context
      );
    }

    res.send(newTranslation);
  }
);

const idParams = z.object({ id: z.coerce.number().int().positive() });

router.put(
  '/:id',
  validate({ params: idParams, body: UpdateTranslationRequestSchema }),
  async (req, res) => {
    const { translation } = req.body;
    const { params, user } = res.locals;
    const updatedTranslation: Translation = await translations.update(
      params.id,
      translation
    );

    const context: string = await translations.getUserTranslationContext(
      Number(user.id),
      params.id
    );

    res.json({ ...updatedTranslation, context });
  }
);

router.delete('/:id', validate({ params: idParams }), async (_req, res) => {
  const { params } = res.locals;

  await translations.remove(params.id);
  res.status(204).send();
});

export default router;
