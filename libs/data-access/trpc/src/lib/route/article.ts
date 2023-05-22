import { z } from 'zod';
import { procedure, protectedProcedure, router } from '../core';

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

const listProcedure = procedure
  .input(
    z
      .object({
        tagId: z.number().optional(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const articles = await ctx.prisma.article.findMany({
      where: {
        tags: {
          some: {
            id: input?.tagId,
          },
        },
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return articles;
  });

export const articleRouter = router({
  add: addProcedure,
  list: listProcedure,
});
