import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FavoriteMutateInput, fromProcedure, injectTRPC } from '@ng-realworld/data-access/trpc-client';
import { map } from 'rxjs';
import { ArticleStore } from './article.store';

@Component({
  selector: 'ng-realworld-article',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ArticleStore],
})
export class ArticleComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly client = injectTRPC();
  private store = inject(ArticleStore);

  readonly article = this.store.selectSignal(state => state.article);
  readonly authorId = this.store.selectSignal(state => state.article?.authorId);
  readonly author = this.store.selectSignal(state => state.author);

  ngOnInit(): void {
    this.store.getArticle(
      this.activatedRoute.paramMap.pipe(
        map(paramMap => {
          const slug = paramMap.get('slug') ?? undefined;
          return { slug };
        })
      )
    );
  }

  fetchAuthorEffect = effect(() => {
    const authorId = this.authorId();
    if (authorId) {
      this.store.getAuthor(authorId);
    }
  });

  onFollow(followingId: number) {
    fromProcedure(this.client.user.follow.mutate)({ id: followingId }).subscribe(response => {
      if (response.msg === 'SUCCESS') {
        this.store.getAuthor(followingId);
      }
    });
  }

  onFavorite(input: FavoriteMutateInput) {
    fromProcedure(this.client.article.favorite.mutate)({
      articleId: input.articleId,
      isFavorited: input.isFavorited,
    }).subscribe(updatedArticle => {
      this.store.setArticle(updatedArticle);
    });
  }
}
