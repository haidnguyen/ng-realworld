import {
  userLoginSchema,
  userRegistrationSchema,
  userSchema,
  userSelect,
  userTokenPayloadSchema,
  userUpdateSchema,
} from '@ng-realworld/data-access/model';
import { TRPCError } from '@trpc/server';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { omit } from 'remeda';
import { JWT_SECRET, SALT_ROUND, procedure, protectedProcedure, router } from '../core';

const createUserProcedure = procedure.input(userRegistrationSchema).mutation(async ({ input, ctx }) => {
  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUND);
  const createdUser = await ctx.prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      password: hashedPassword,
    },
    select: userSelect,
  });
  return createdUser;
});

const loginProcedure = procedure.input(userLoginSchema).mutation(async ({ input, ctx }) => {
  const user = await ctx.prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, email: true, username: true, bio: true, image: true, password: true },
  });
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  const isPasswordMatched = await bcrypt.compare(input.password, user.password);
  if (!isPasswordMatched) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '600s' });
  const refreshToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7 days' });
  ctx.res.cookie('refreshToken', refreshToken, { httpOnly: true, expires: new Date(Date.now() + 7 * 86400000) });
  await ctx.prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken,
    },
    select: userSelect,
  });

  return {
    token,
    refreshToken,
    user,
  };
});

const accessTokenProcedure = procedure.query(async ({ ctx }) => {
  const unauthorizedError = new TRPCError({ code: 'UNAUTHORIZED' });
  const refreshToken = ctx.req.cookies.refreshToken;
  const result = userTokenPayloadSchema.safeParse(jwt.verify(refreshToken, JWT_SECRET));
  if (!result.success) {
    throw unauthorizedError;
  }
  const user = await ctx.prisma.user.findUnique({
    where: { id: result.data.id },
    select: { refreshToken: true, id: true, email: true },
  });
  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
    });
  }
  const isRefreshTokenEqual = user?.refreshToken === refreshToken;
  if (!isRefreshTokenEqual) {
    throw unauthorizedError;
  }

  const updatedRefreshToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7 days' });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '600s' });
  ctx.res.cookie('refreshToken', updatedRefreshToken, { httpOnly: true, expires: new Date(Date.now() + 7 * 86400000) });
  await ctx.prisma.user.update({ where: { id: user.id }, data: { refreshToken: updatedRefreshToken } });

  return { token };
});

const meProcedure = protectedProcedure.query(({ ctx }) => {
  const { user } = ctx;

  return user;
});

const updateProcedure = protectedProcedure.input(userUpdateSchema).mutation(async ({ ctx, input }) => {
  const data = input;

  if (input.password) {
    data.password = await bcrypt.hash(input.password, SALT_ROUND);
  }

  const updatedUser = await ctx.prisma.user.update({
    where: { id: ctx.user.id },
    data,
    select: userSelect,
  });

  return updatedUser;
});

const getByUsernameProcedure = procedure.input(userSchema.pick({ username: true })).query(async ({ ctx, input }) => {
  const user = await ctx.prisma.user.findUnique({
    where: { username: input.username },
    include: {
      _count: true,
      articles: {
        include: {
          author: { select: userSelect },
          tags: true,
        },
      },
    },
  });

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
    });
  }

  return omit(user, ['password']);
});

const logoutProcedure = protectedProcedure.mutation(async ({ ctx }) => {
  await ctx.prisma.user.update({
    where: {
      id: ctx.user.id,
    },
    data: {
      refreshToken: null,
    },
  });

  ctx.res.cookie('refreshToken', 'deleted', { httpOnly: true, expires: new Date(0) });
  return { message: 'SUCCESS' };
});

export const userRouter = router({
  create: createUserProcedure,
  login: loginProcedure,
  me: meProcedure,
  accessToken: accessTokenProcedure,
  update: updateProcedure,
  getByUsername: getByUsernameProcedure,
  logout: logoutProcedure,
});
