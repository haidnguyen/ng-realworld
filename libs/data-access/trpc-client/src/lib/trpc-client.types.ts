import type { AppRouter } from '@ng-realworld/data-access/trpc';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export type ArticleListItemOutput = inferRouterOutputs<AppRouter>['article']['list'][number];
export type TagListItemOutput = inferRouterOutputs<AppRouter>['tag']['list'][number];
export type FavoriteMutateInput = inferRouterInputs<AppRouter>['article']['favorite'];
