import { router } from '../core';
import { articleRouter } from './article';
import { userRouter } from './user';

export const appRouter = router({
  user: userRouter,
  article: articleRouter,
});
