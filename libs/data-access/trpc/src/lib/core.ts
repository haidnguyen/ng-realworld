import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

export const createContext = (context: trpcExpress.CreateExpressContextOptions) => ({
  req: context.req,
  res: context.res,
});

const t = initTRPC.context<typeof createContext>().create();

export const procedure = t.procedure;
export const middleware = t.middleware;
export const router = t.router;
