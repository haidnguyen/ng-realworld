import { userLoginSchema, userRegistrationSchema } from '@ng-realworld/data-access/model';
import { TRPCError } from '@trpc/server';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { omit } from 'remeda';
import { SALT_ROUND, procedure, router } from '../core';

const JWT_SECRET = '__CONDUIT_JWT_SECRET__';

const createUserProcedure = procedure.input(userRegistrationSchema).mutation(async ({ input, ctx }) => {
  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUND);
  const createdUser = await ctx.prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      image: true,
    },
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
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET);
  ctx.res.cookie('refreshToken', refreshToken, { httpOnly: true });
  await ctx.prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken,
    },
  });

  return {
    token,
    refreshToken,
    user: omit(user, ['password']),
  };
});

export const userRoute = router({
  create: createUserProcedure,
  login: loginProcedure,
});
