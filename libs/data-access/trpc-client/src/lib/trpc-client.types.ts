import type { AppRouter } from '@ng-realworld/data-access/trpc';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export type ArticleListItemOutput = inferRouterOutputs<AppRouter>['article']['list'][number];
export type TagListItemOutput = inferRouterOutputs<AppRouter>['tag']['list'][number];
export type FavoriteMutateInput = inferRouterInputs<AppRouter>['article']['favorite'];
export type ArticleItemOutput = inferRouterOutputs<AppRouter>['article']['get'];
export type ArticleItemInput = inferRouterInputs<AppRouter>['article']['get'];
export type UserItemOutput = inferRouterOutputs<AppRouter>['user']['getById'];

export type CommentListOutput = inferRouterOutputs<AppRouter>['comment']['list'];
export type CommentItemOutput = inferRouterOutputs<AppRouter>['comment']['add'];
