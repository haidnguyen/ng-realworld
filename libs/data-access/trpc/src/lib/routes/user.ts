import { userRegistrationSchema } from '@ng-realworld/data-access/model';
import { procedure, router } from '../core';

const createUserProcedure = procedure.input(userRegistrationSchema).mutation(async ({ input, ctx }) => {
  const createdUser = await ctx.prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      password: input.password,
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
export const userRoute = router({
  create: createUserProcedure,
});
