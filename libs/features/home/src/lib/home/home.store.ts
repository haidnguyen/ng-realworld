import { Injectable } from '@angular/core';
import {
  ArticleListItemOutput,
  FavoriteMutateInput,
  TagListItemOutput,
  fromProcedure,
  injectTRPC,
} from '@ng-realworld/data-access/trpc-client';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import update from 'immutability-helper';
import { Observable, switchMap, tap } from 'rxjs';

interface HomeState extends EntityState<ArticleListItemOutput> {
  tags: TagListItemOutput[];
  selectedTagId?: TagListItemOutput['id'];
}

const adapter = createEntityAdapter<ArticleListItemOutput>({
  selectId: article => article.id,
});

const INIT_STATE: HomeState = adapter.getInitialState({
  tags: [],
});
export const { selectIds, selectEntities, selectAll } = adapter.getSelectors();

@Injectable()
export class HomeStore extends ComponentStore<HomeState> {
  private readonly client = injectTRPC();

  readonly setArticles = this.updater((state, articles: ArticleListItemOutput[]) => {
    return adapter.setAll(articles, state);
  });
  readonly setArticle = this.updater((state, article: ArticleListItemOutput) => {
    return adapter.setOne(article, state);
  });
  readonly setTags = this.updater((state, tags: TagListItemOutput[]) => update(state, { tags: { $set: tags } }));
  readonly updateSelectedTagId = this.updater((state, tagId: HomeState['selectedTagId']) =>
    update(state, { selectedTagId: { $set: tagId } })
  );

  readonly getArticles = this.effect((tagId$: Observable<number | undefined>) => {
    return tagId$.pipe(
      switchMap(tagId =>
        fromProcedure(this.client.article.list.query)({ tagId }).pipe(
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

  readonly favorite = this.effect<FavoriteMutateInput>(id$ =>
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
