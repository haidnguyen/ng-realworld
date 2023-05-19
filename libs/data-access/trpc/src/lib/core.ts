import { PrismaClient } from '@prisma/client';
import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { ZodError } from 'zod';

const prisma = new PrismaClient();

export const createContext = (context: trpcExpress.CreateExpressContextOptions) => ({
  prisma,
  req: context.req,
  res: context.res,
});

const t = initTRPC.context<typeof createContext>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;

    return {
      ...shape,
      data: {
        ...shape.data,
        flatError: error.code === 'BAD_REQUEST' && error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const procedure = t.procedure;
export const middleware = t.middleware;
export const router = t.router;
export const SALT_ROUND = 10;
