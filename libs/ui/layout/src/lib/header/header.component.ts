import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@ng-realworld/data-access/service';
import { fromProcedure, injectTRPC, isTRPCClientError } from '@ng-realworld/data-access/trpc-client';

@Component({
  selector: 'ng-realworld-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-light">
      <div class="container">
        <a class="navbar-brand" href="/">conduit</a>
        <ul class="nav navbar-nav pull-xs-right">
          <li class="nav-item">
            <a class="nav-link" routerLink="/home" routerLinkActive="active">Home</a>
          </li>
          <li class="nav-item" *ngIf="isAuth()">
            <a class="nav-link" routerLink="/editor" routerLinkActive="active">
              <i class="ion-compose"></i>
              &nbsp;New Article
            </a>
          </li>
          <li class="nav-item" *ngIf="isAuth()">
            <a class="nav-link" routerLink="/setting" routerLinkActive="active">
              <i class="ion-gear-a"></i>
              &nbsp;Settings
            </a>
          </li>

          <ng-container *ngIf="isAuth(); else unauthTmpl">
            <li class="nav-item logout-btn">
              <a class="nav-link">{{ user()?.username }}</a>
            </li>
          </ng-container>

          <ng-template #unauthTmpl>
            <li class="nav-item">
              <a class="nav-link" routerLink="/login" routerLinkActive="active">Sign in</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/register" routerLinkActive="active">Sign up</a>
            </li>
          </ng-template>
        </ul>
      </div>
    </nav>
  `,
  styles: [
    `
      .logout-btn {
        cursor: pointer;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly client = injectTRPC();
  readonly isAuth = this.authService.isAuth;
  readonly user = this.authService.currentUser;

  ngOnInit(): void {
    if (this.authService.isAuth()) {
      fromProcedure(this.client.user.me.query)().subscribe({
        next: user => {
          this.authService.authenticated(user);
        },
        error: (err: unknown) => {
          if (isTRPCClientError(err) && err.data?.code === 'INTERNAL_SERVER_ERROR') {
            this.authService.logout();
          }
        },
      });
    }
  }
}
