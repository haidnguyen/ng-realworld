import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
          <li class="nav-item">
            <a class="nav-link" href="">
              <i class="ion-compose"></i>
              &nbsp;New Article
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="">
              <i class="ion-gear-a"></i>
              &nbsp;Settings
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/login" routerLinkActive="active">Sign in</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/register" routerLinkActive="active">Sign up</a>
          </li>
        </ul>
      </div>
    </nav>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
