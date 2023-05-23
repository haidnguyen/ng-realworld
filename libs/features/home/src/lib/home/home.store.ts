import { Injectable } from '@angular/core';
import { AppRouter } from '@ng-realworld/data-access/trpc';
import { fromProcedure, injectTRPC } from '@ng-realworld/data-access/trpc-client';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { Observable, switchMap, tap } from 'rxjs';

type Article = inferRouterOutputs<AppRouter>['article']['list'][number];
type Tags = inferRouterOutputs<AppRouter>['tag']['list'];
interface HomeState extends EntityState<Article> {
  tags: Tags;
  selectedTagId?: Tags[number]['id'];
}

const adapter = createEntityAdapter<Article>({
  selectId: article => article.id,
});

const INIT_STATE: HomeState = adapter.getInitialState({
  tags: [],
});
export const { selectIds, selectEntities, selectAll } = adapter.getSelectors();

@Injectable()
export class HomeStore extends ComponentStore<HomeState> {
  private readonly client = injectTRPC();

  readonly setArticles = this.updater((state, articles: Article[]) => {
    return adapter.setAll(articles, state);
  });
  readonly setArticle = this.updater((state, article: Article) => {
    return adapter.setOne(article, state);
  });
  readonly setTags = this.updater((state, tags: Tags) => ({
    ...state,
    tags,
  }));
  readonly updateSelectedTagId = this.updater((state, tagId: HomeState['selectedTagId']) => ({
    ...state,
    selectedTagId: tagId,
  }));

  readonly getArticles = this.effect((tagId$: Observable<number | undefined>) => {
    return tagId$.pipe(
      switchMap(tagId =>
        fromProcedure(this.client.article.list.query)(tagId ? { tagId } : undefined).pipe(
          tapResponse({
            next: data => {
              this.setArticles(data);
            },
            error: err => {
              console.log({ err });
            },
          })
        )
      )
    );
  });

  readonly getTags = this.effect<void>(trigger$ =>
    trigger$.pipe(
      switchMap(() => this.client.tag.list.query()),
      tap(data => {
        this.setTags(data);
      })
    )
  );

  readonly favorite = this.effect<inferRouterInputs<AppRouter>['article']['favorite']>(id$ =>
    id$.pipe(
      switchMap(input => this.client.article.favorite.mutate(input)),
      tap(updatedArticle => {
        this.setArticle(updatedArticle);
      })
    )
  );

  constructor() {
    super(INIT_STATE);
  }
}
