import { userTokenPayloadSchema } from '@ng-realworld/data-access/model';
import { PrismaClient } from '@prisma/client';
import { TRPCError, inferAsyncReturnType, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import * as jwt from 'jsonwebtoken';
import { ZodError } from 'zod';

const prisma = new PrismaClient();

const isTokenExpiredError = (err: unknown): err is Error => {
  return err instanceof Error && err.name === 'TokenExpiredError';
};

const getTokenPayload = (token?: string) => {
  if (!token) {
    return [false, null];
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return [false, payload];
  } catch (err) {
    if (isTokenExpiredError(err)) {
      return [true, null];
    }
    return [false, null];
  }
};

const getUserFromPayload = async (payload: unknown) => {
  const result = userTokenPayloadSchema.safeParse(payload);
  if (!result.success) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: result.data.id },
    select: {
      id: true,
      email: true,
      image: true,
      bio: true,
      username: true,
    },
  });
  return user;
};

export const createContext = async (context: trpcExpress.CreateExpressContextOptions) => {
  const headers = context.req.headers;
  const [isTokenExpired, payload] = getTokenPayload(headers.authorization);
  const user = await getUserFromPayload(payload);

  return {
    user,
    prisma,
    isTokenExpired,
    req: context.req,
    res: context.res,
  };
};

type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create({
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

const isAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    if (ctx.isTokenExpired) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'TOKEN_EXPIRED' });
    }
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const procedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuth);
export const router = t.router;
export const SALT_ROUND = 10;
export const JWT_SECRET = '__CONDUIT_JWT_SECRET__';
