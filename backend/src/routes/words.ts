import express from 'express';
import { z } from 'zod';
import words from '../services/words';
import {
  UserWord,
  UserWordSchema,
  UpdateWordRequestSchema,
} from '@alexandria/shared';
import { validate } from '../utils/middleware';

const router = express.Router();

const textLanguageParams = z.object({
  textId: z.coerce.number().int().positive(),
  languageId: z.string().min(1),
});

router.get(
  '/text/:textId/language/:languageId',
  validate({ params: textLanguageParams }),
  async (_req, res): Promise<void> => {
    const { user, params } = res.locals;

    const userwordsInText: Array<UserWord> = await words.getUserwordsInText(
      Number(user.id),
      params.textId,
      params.languageId,
      true
    );
    res.json(userwordsInText);
  }
);

const languageParams = z.object({ languageId: z.string().min(1) });

router.get(
  '/language/:languageId',
  validate({ params: languageParams }),
  async (_req, res): Promise<void> => {
    const { user, params } = res.locals;

    const userwordsInLanguage: Array<UserWord> =
      await words.getUserwordsByLanguage(params.languageId, Number(user.id));

    res.json(userwordsInLanguage);
  }
);

router.post(
  '/',
  validate({ body: UserWordSchema }),
  async (req, res): Promise<void> => {
    const { user } = res.locals;
    const userWordData: UserWord = req.body;

    const newUserWord: UserWord = await words.addNewUserWord(
      user,
      userWordData
    );

    res.status(201).json(newUserWord);
  }
);

const wordIdParams = z.object({ id: z.coerce.number().int().positive() });

router.put(
  '/:id',
  validate({ params: wordIdParams, body: UpdateWordRequestSchema }),
  async (req, res): Promise<void> => {
    const { user, params } = res.locals;
    const { status } = req.body;

    if (status) {
      const updatedStatus: string = await words.updateStatus(
        params.id,
        Number(user.id),
        status
      );
      res.send(updatedStatus);
    } else {
      await words.removeUserWord(params.id, Number(user.id));
      res.status(204).send();
    }
  }
);

export default router;
