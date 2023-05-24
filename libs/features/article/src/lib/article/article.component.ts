import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { injectTRPC } from '@ng-realworld/data-access/trpc-client';
import { EMPTY, switchMap } from 'rxjs';

@Component({
  selector: 'ng-realworld-article',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly client = injectTRPC();

  readonly article = toSignal(
    this.activatedRoute.paramMap.pipe(
      switchMap(paramMap => {
        const slug = paramMap.get('slug');

        if (!slug) {
          return EMPTY;
        }

        return this.client.article.getBySlug.query({ slug });
      })
    )
  );

  onFollow(followingId: number) {
    console.log({ followingId });
  }
}
