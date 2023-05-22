import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { fromProcedure, injectTRPC } from '@ng-realworld/data-access/trpc-client';
import { switchMap } from 'rxjs';

@Component({
  selector: 'ng-realworld-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-page">
      <div class="banner">
        <div class="container">
          <h1 class="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>

      <div class="container page">
        <div class="row">
          <div class="col-md-9">
            <div class="feed-toggle">
              <ul class="nav nav-pills outline-active">
                <li class="nav-item">
                  <a class="nav-link disabled" href="">Your Feed</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link active" href="">Global Feed</a>
                </li>
              </ul>
            </div>

            <div class="article-preview" *ngFor="let article of articles()">
              <div class="article-meta">
                <a routerLink="/"><img src="http://i.imgur.com/N4VcUeJ.jpg" /></a>
                <div class="info">
                  <a routerLink="/profile" class="author">{{ article.author.username }}</a>
                  <span class="date">{{ article.createdAt | date : 'mediumDate' }}</span>
                </div>
                <button class="btn btn-outline-primary btn-sm pull-xs-right">
                  <i class="ion-heart"></i>
                  32
                </button>
              </div>
              <a [routerLink]="['article', article.slug]" class="preview-link">
                <h1>{{ article.title }}</h1>
                <p>{{ article.description }}</p>
                <span>Read more...</span>
              </a>
            </div>
          </div>

          <div class="col-md-3">
            <div class="sidebar">
              <p>Popular Tags</p>

              <div class="tag-list">
                <a class="tag-pill tag-default pointer" *ngFor="let tag of tags()" (click)="onChangeTag(tag.id)">
                  {{ tag.name }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .pointer {
        cursor: pointer;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly client = injectTRPC();

  readonly selectedTagId = signal<number | undefined>(undefined);

  readonly articles = toSignal(
    toObservable(this.selectedTagId).pipe(
      switchMap(tagId => this.client.article.list.query(tagId ? { tagId } : undefined))
    ),
    { initialValue: [] }
  );
  readonly tags = toSignal(fromProcedure(this.client.tag.list.query)(), { initialValue: [] });

  onChangeTag(tagId: number) {
    this.selectedTagId.set(tagId);
  }
}
