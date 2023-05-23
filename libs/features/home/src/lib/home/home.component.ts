import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ArticlePreviewComponent } from '../article-preview/article-preview.component';
import { HomeStore, selectAll } from './home.store';

@Component({
  selector: 'ng-realworld-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ArticlePreviewComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.style.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeStore],
})
export class HomeComponent implements OnInit {
  private readonly store = inject(HomeStore);

  readonly articles = this.store.selectSignal(selectAll);
  readonly ids = this.store.selectSignal(state => state.ids as number[]);
  readonly tags = this.store.selectSignal(state => state.tags);
  readonly selectedTagId = this.store.selectSignal(state => state.selectedTagId);
  readonly selectedTag = this.store.selectSignal(state => {
    return state.tags.find(tag => tag.id === state.selectedTagId);
  });

  readonly fetchData = effect(() => {
    this.store.getArticles(this.selectedTagId());
  });

  ngOnInit(): void {
    this.store.getTags();
  }

  onChangeTag(tagId: number) {
    this.store.updateSelectedTagId(tagId);
  }

  onClearTag() {
    this.store.updateSelectedTagId(undefined);
  }

  onFavorite(articleId: number, isFavorited: boolean) {
    this.store.favorite({ articleId, isFavorited });
  }

  trackByFn(id: number) {
    return id;
  }
}
