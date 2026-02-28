import express from 'express';
import translations from '../services/translations';
import { Translation } from '../types';

const router = express.Router();

router.post('/', async (req, res) => {
  const { user } = res.locals;
  const { wordId, translation, targetLanguageId, context } = req.body;

  const newTranslation: Translation = await translations.add(
    Number(wordId),
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
});

router.put('/:id', async (req, res) => {
  const { translation } = req.body;
  const { id } = req.params;
  const updatedTranslation: Translation = await translations.update(
    Number(id),
    translation
  );

  const { user } = res.locals;
  const context: string = await translations.getUserTranslationContext(
    Number(user.id),
    Number(id)
  );

  res.json({ ...updatedTranslation, context });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  await translations.remove(Number(id));
  res.status(204).send();
});

export default router;
