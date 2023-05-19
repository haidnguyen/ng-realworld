import { router } from '../core';
import { userRoute } from './user';

export const appRouter = router({
  user: userRoute,
});
