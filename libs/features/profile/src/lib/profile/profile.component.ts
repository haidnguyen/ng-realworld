import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { injectTRPC } from '@ng-realworld/data-access/trpc-client';
import { NEVER, switchMap } from 'rxjs';

@Component({
  selector: 'ng-realworld-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-page" *ngIf="profile() as profile">
      <div class="user-info">
        <div class="container">
          <div class="row">
            <div class="col-xs-12 col-md-10 offset-md-1">
              <img src="http://i.imgur.com/Qr71crq.jpg" class="user-img" />
              <h4>{{ profile.username }}</h4>
              <p>{{ profile.bio }}</p>
              <button class="btn btn-sm btn-outline-secondary action-btn">
                <i class="ion-plus-round"></i>
                &nbsp; Follow {{ profile.username }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">
            <div class="articles-toggle">
              <ul class="nav nav-pills outline-active">
                <li class="nav-item">
                  <a class="nav-link active" href="">My Articles</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="">Favorited Articles</a>
                </li>
              </ul>
            </div>

            <div class="article-preview" *ngFor="let article of profile.articles">
              <div class="article-meta">
                <a href=""><img src="http://i.imgur.com/Qr71crq.jpg" /></a>
                <div class="info">
                  <a href="" class="author">{{ article.author.username }}</a>
                  <span class="date">{{ article.createdAt | date : 'mediumDate' }}</span>
                </div>
                <button class="btn btn-outline-primary btn-sm pull-xs-right">
                  <i class="ion-heart"></i>
                  29
                </button>
              </div>
              <a href="" class="preview-link">
                <h1>{{ article.title }}</h1>
                <p>{{ article.description }}</p>
                <span>Read more...</span>
                <ul class="tag-list">
                  <li class="tag-default tag-pill tag-outline" *ngFor="let tag of article.tags">{{ tag.name }}</li>
                </ul>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly client = injectTRPC();

  readonly profile = toSignal(
    this.activatedRoute.paramMap.pipe(
      switchMap(paramMap => {
        const username = paramMap.get('username');
        if (!username) {
          return NEVER;
        }

        return this.client.user.getByUsername.query({ username });
      })
    ),
    { initialValue: null }
  );
}
