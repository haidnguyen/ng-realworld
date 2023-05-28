import { userSelect } from '@ng-realworld/data-access/model';
import { z } from 'zod';
import { procedure, protectedProcedure, router } from '../core';

const addProcedure = protectedProcedure
  .input(z.object({ articleId: z.number(), body: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const comment = await ctx.prisma.comment.create({
      data: {
        body: input.body,
        articleId: input.articleId,
        authorId: ctx.user.id,
      },
      select: {
        author: {
          select: userSelect,
        },
        body: true,
        createdAt: true,
      },
    });

    return comment;
  });

const listProcedure = procedure.input(z.object({ articleId: z.number() })).query(async ({ ctx, input }) => {
  const comments = await ctx.prisma.comment.findMany({
    where: {
      articleId: input.articleId,
    },
    select: {
      author: {
        select: userSelect,
      },
      body: true,
      createdAt: true,
    },
  });

  return comments;
});
export const commentRouter = router({
  add: addProcedure,
  list: listProcedure,
});
