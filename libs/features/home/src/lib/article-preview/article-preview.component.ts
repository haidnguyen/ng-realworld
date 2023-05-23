import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ArticleListItemOutput, FavoriteMutateInput } from '@ng-realworld/data-access/trpc-client';
import { HomeStore, selectEntities } from '../home/home.store';

@Component({
  selector: 'ng-realworld-article-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article-preview.component.html',
  styleUrls: ['./article-preview.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePreviewComponent {
  private readonly store = inject(HomeStore);
  private readonly _id = signal<ArticleListItemOutput['id'] | null>(null);

  @Input({ required: true })
  set articleId(id: ArticleListItemOutput['id']) {
    this._id.set(id);
  }
  @Output() favorite = new EventEmitter<FavoriteMutateInput>();

  readonly entities = this.store.selectSignal(selectEntities);
  readonly article = computed(() => {
    const id = this._id();
    if (id) {
      return this.entities()[id];
    }
    return null;
  });
  onFavorite(input: FavoriteMutateInput) {
    this.favorite.next(input);
  }
}
