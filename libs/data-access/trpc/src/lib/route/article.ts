import { z } from 'zod';
import { protectedProcedure, router } from '../core';

const addProcedure = protectedProcedure
  .input(
    z.object({
      title: z.string(),
      description: z.string(),
      body: z.string(),
      tags: z.array(z.string()),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const article = await ctx.prisma.article.create({
      data: {
        title: input.title,
        description: input.description,
        body: input.body,
        slug: `${input.title.toLowerCase().replaceAll(' ', '-')}${ctx.user.id}`,
        author: {
          connect: {
            id: ctx.user.id,
          },
        },
        tags: {
          connectOrCreate: input.tags.map(tag => ({
            where: {
              name: tag,
            },
            create: {
              name: tag,
            },
          })),
        },
      },
    });

    return article;
  });

export const articleRouter = router({
  add: addProcedure,
});
