import { FavoritedArticle } from '@prisma/client';
import { map, merge, omit, pipe } from 'remeda';
import { z } from 'zod';
import { procedure, protectedProcedure, router } from '../core';

type WithFavoritedArticles = {
  favoritedArticles: FavoritedArticle[];
};

const computedFavoritesCount =
  (userId?: number) =>
  <T extends WithFavoritedArticles>(article: T) => {
    const favoritesCount = article.favoritedArticles.length;
    const favorited = !!article.favoritedArticles.find(item => item.userId === userId);

    return merge(article, { favoritesCount, favorited });
  };

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
        favoritedArticles: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return pipe(articles, map(computedFavoritesCount(ctx.user?.id)), map(omit(['favoritedArticles'])));
  });

const favoriteProcedure = protectedProcedure
  .input(z.object({ articleId: z.number(), isFavorited: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    const updatedArticle = await ctx.prisma.article.update({
      where: {
        id: input.articleId,
      },
      data: {
        favoritedArticles: {
          ...(input.isFavorited
            ? {
                create: {
                  userId: ctx.user.id,
                },
              }
            : {
                delete: {
                  userId_articleId: {
                    userId: ctx.user.id,
                    articleId: input.articleId,
                  },
                },
              }),
        },
      },
      include: {
        author: true,
        favoritedArticles: true,
      },
    });
    return pipe(updatedArticle, computedFavoritesCount(ctx.user.id), omit(['favoritedArticles']));
  });

export const articleRouter = router({
  add: addProcedure,
  list: listProcedure,
  favorite: favoriteProcedure,
});
