import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext, router } from './core';
import { userRoute } from './routes/user.route';

const appRouter = router({
  user: userRoute,
});

export type AppRouter = typeof appRouter;

export const trpcMiddleware = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
});
