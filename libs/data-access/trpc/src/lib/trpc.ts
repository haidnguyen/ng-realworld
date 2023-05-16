import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';
import { procedure, router } from './core';

const createContext = (
  context: trpcExpress.CreateExpressContextOptions
): { req: trpcExpress.CreateExpressContextOptions['req']; res: trpcExpress.CreateExpressContextOptions['res'] } => ({
  req: context.req,
  res: context.res,
});

const appRouter = router({
  getTest: procedure.input(z.string()).query(({ input }) => {
    return { msg: 'Hello from trpc ' + input };
  }),
});

export type AppRouter = typeof appRouter;

export const trpcMiddleware = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
});
