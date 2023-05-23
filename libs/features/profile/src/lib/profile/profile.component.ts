import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { injectTRPC, isTRPCClientError } from '@ng-realworld/data-access/trpc-client';
import { NEVER, catchError, switchMap } from 'rxjs';

@Component({
  selector: 'ng-realworld-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.style.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly client = injectTRPC();
  private readonly router = inject(Router);

  readonly profile = toSignal(
    this.activatedRoute.paramMap.pipe(
      switchMap(paramMap => {
        const username = paramMap.get('username');
        if (!username) {
          return NEVER;
        }

        return this.client.user.getByUsername.query({ username });
      }),
      catchError(err => {
        if (isTRPCClientError(err)) {
          if (err.message === 'NOT_FOUND') {
            this.router.navigate(['/', 'home']);
          }
        }
        return NEVER;
      })
    ),
    { initialValue: null }
  );
}
