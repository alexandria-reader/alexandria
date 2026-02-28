/* eslint-disable max-len */
import express from 'express';
import words from '../services/words';
import { UserWord } from '../types';

const router = express.Router();

router.get(
  '/text/:textId/language/:languageId',
  async (req, res): Promise<void> => {
    const { user } = res.locals;

    const { textId, languageId } = req.params;

    const userwordsInText: Array<UserWord> = await words.getUserwordsInText(
      Number(user.id),
      Number(textId),
      languageId,
      true
    );
    res.json(userwordsInText);
  }
);

router.get('/language/:languageId', async (req, res): Promise<void> => {
  const { user } = res.locals;

  const { languageId } = req.params;
  const userwordsInLanguage: Array<UserWord> =
    await words.getUserwordsByLanguage(languageId, Number(user.id));

  res.json(userwordsInLanguage);
});

router.post('/', async (req, res): Promise<void> => {
  const { user } = res.locals;
  const userWordData: UserWord = req.body;

  const newUserWord: UserWord = await words.addNewUserWord(user, userWordData);

  res.status(201).json(newUserWord);
});

router.put('/:id', async (req, res): Promise<void> => {
  const { user } = res.locals;
  const { id } = req.params;
  const { status } = req.body;

  if (status) {
    const updatedStatus: string = await words.updateStatus(
      Number(id),
      Number(user.id),
      status
    );
    res.send(updatedStatus);
  } else {
    await words.removeUserWord(Number(id), Number(user.id));
    res.status(204).send();
  }
});

export default router;
