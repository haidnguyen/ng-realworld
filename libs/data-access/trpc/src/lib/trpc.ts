import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from './core';
import { appRouter } from './routes/_app';

export const trpcMiddleware = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
});

export type AppRouter = typeof appRouter;
