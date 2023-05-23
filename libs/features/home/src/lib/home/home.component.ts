import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { fromProcedure, injectTRPC } from '@ng-realworld/data-access/trpc-client';
import { switchMap } from 'rxjs';

type Awaited<T> = T extends Promise<infer U> ? U : never;

@Component({
  selector: 'ng-realworld-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.style.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly client = injectTRPC();

  readonly selectedTagId = signal<number | undefined>(undefined);
  readonly tags = toSignal(fromProcedure(this.client.tag.list.query)(), { initialValue: [] });
  readonly selectedTag = computed(() => {
    return this.tags().find(tag => tag.id === this.selectedTagId());
  });

  private readonly fetchArticles = toSignal(
    toObservable(this.selectedTagId).pipe(
      switchMap(tagId => this.client.article.list.query(tagId ? { tagId } : undefined))
    ),
    { initialValue: [] }
  );
  readonly updateArticle = signal<Awaited<ReturnType<typeof this.client.article.favorite.mutate>> | null>(null);
  readonly articles = computed(() => {
    const fetchArticles = this.fetchArticles();
    const updatedArticle = this.updateArticle();
    if (updatedArticle) {
      const index = fetchArticles.findIndex(article => article.id === updatedArticle.id);
      fetchArticles[index] = updatedArticle;
    }

    return fetchArticles;
  });

  onChangeTag(tagId: number) {
    this.selectedTagId.set(tagId);
  }

  onClearTag() {
    this.selectedTagId.set(undefined);
  }

  onFavorite(articleId: number, isFavorited: boolean) {
    fromProcedure(this.client.article.favorite.mutate)({ articleId, isFavorited }).subscribe(updatedArticle => {
      this.updateArticle.set(updatedArticle);
    });
  }
}
