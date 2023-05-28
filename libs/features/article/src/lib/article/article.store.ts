import { Injectable } from '@angular/core';
import {
  ArticleItemInput,
  ArticleItemOutput,
  CommentItemOutput,
  CommentListOutput,
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
  comments: CommentListOutput | null;
}

@Injectable()
export class ArticleStore extends ComponentStore<ArticleState> {
  private readonly client = injectTRPC();
  constructor() {
    super({ article: null, author: null, comments: [] });
  }

  readonly setArticle = this.updater((state, article: ArticleItemOutput) => {
    return update(state, { article: { $set: article } });
  });

  readonly setAuthor = this.updater((state, author: UserItemOutput) => {
    return update(state, { author: { $set: author } });
  });

  readonly setComments = this.updater((state, comments: CommentListOutput) => {
    return update(state, { comments: { $set: comments } });
  });

  readonly addComment = this.updater((state, comment: CommentItemOutput) => {
    return update(state, { comments: { $push: [comment] } });
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

  readonly getComments = this.effect<number>(articleId$ => {
    return articleId$.pipe(
      switchMap(articleId =>
        fromProcedure(this.client.comment.list.query)({ articleId }).pipe(
          tapResponse({
            next: comments => {
              this.setComments(comments);
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
