import boom from '@hapi/boom';
import express from 'express';
import texts from '../services/texts';
import readingProgress from '../services/reading-progress';
import users from '../services/users';
import { TextPagination, Text } from '@alexandria/shared';

const router: express.Router = express.Router();

router.get('/language/:languageId/:page/', async (req, res): Promise<void> => {
  const { user } = res.locals;
  const { languageId, page } = req.params;
  const textPagination: TextPagination = await texts.getByUserAndLanguage(
    Number(user.id),
    languageId,
    page
  );
  res.json(textPagination);
});

router.get('/:id', async (req, res): Promise<void> => {
  const { user } = res.locals;
  const { id } = req.params;

  const textById: Text = await texts.getById(Number(id), Number(user.id));

  if (textById.userId !== user.id) {
    throw boom.forbidden('You do not have access to this text.');
  }

  res.json(textById);
});

router.get('/', async (_req, res): Promise<void> => {
  const { user } = res.locals;
  const isAdmin = await users.isAdmin(Number(user.id));

  if (!isAdmin) {
    throw boom.forbidden('Admin access required.');
  }

  const allTexts: Array<Text> = await texts.getAll();
  res.json(allTexts);
});

router.post('/', async (req, res): Promise<void> => {
  const { user } = res.locals;

  if (!user.verified) {
    throw boom.forbidden('You must verify your email before adding texts.');
  }

  const textData: Text = req.body;
  textData.userId = user.id;

  const text: Text = await texts.addNew(textData);
  res.json(text);
});

router.put('/:id/progress', async (req, res): Promise<void> => {
  const { user } = res.locals;
  const id: number = Number(req.params.id);
  const { pageStartWordIndex } = req.body;

  const text: Text = await texts.getById(id, Number(user.id));

  if (text.userId !== user.id) {
    throw boom.forbidden('You do not have access to this text.');
  }

  const progress = await readingProgress.save(
    Number(user.id),
    id,
    pageStartWordIndex
  );
  res.json(progress);
});

router.put('/:id', async (req, res): Promise<void> => {
  const { user } = res.locals;

  const id: number = Number(req.params.id);
  const textData = req.body;

  if (textData.userId !== user.id) {
    throw boom.forbidden('You do not have access to this text.');
  }

  const updatedText: Text = await texts.update({ id, ...textData });
  res.json(updatedText);
});

router.delete('/:id', async (req, res): Promise<void> => {
  const { user } = res.locals;
  const id: number = Number(req.params.id);

  const toBeDeleted: Text = await texts.getById(id, Number(user.id));

  if (toBeDeleted.userId !== user.id) {
    throw boom.forbidden('You do not have access to this text.');
  }

  await texts.remove(id);
  res.status(204).send();
});

export default router;
