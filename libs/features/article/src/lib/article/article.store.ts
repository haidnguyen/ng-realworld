import { Injectable } from '@angular/core';
import {
  ArticleItemInput,
  ArticleItemOutput,
  UserItemOutput,
  fromProcedure,
  injectTRPC,
} from '@ng-realworld/data-access/trpc-client';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import update from 'immutability-helper';
import { switchMap } from 'rxjs';

interface ArticleState {
  article: ArticleItemOutput | null;
  author: UserItemOutput | null;
}

@Injectable()
export class ArticleStore extends ComponentStore<ArticleState> {
  private readonly client = injectTRPC();
  constructor() {
    super({ article: null, author: null });
  }

  readonly setArticle = this.updater((state, article: ArticleItemOutput) => {
    return update(state, { article: { $set: article } });
  });

  readonly setAuthor = this.updater((state, author: UserItemOutput) => {
    return update(state, { author: { $set: author } });
  });

  readonly getArticle = this.effect<ArticleItemInput>(input$ => {
    return input$.pipe(
      switchMap(input =>
        fromProcedure(this.client.article.get.query)(input).pipe(
          tapResponse({
            next: data => {
              this.setArticle(data);
            },
            error: err => {
              console.log({ err });
            },
          })
        )
      )
    );
  });

  readonly getAuthor = this.effect<number>(id$ => {
    return id$.pipe(
      switchMap(id =>
        fromProcedure(this.client.user.getById.query)({ id }).pipe(
          tapResponse({
            next: data => {
              this.setAuthor(data);
            },
            error: err => {
              console.log({ err });
            },
          })
        )
      )
    );
  });
}
