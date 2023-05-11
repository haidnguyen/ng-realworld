import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ng-realworld-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer>
      <div class="container">
        <a href="/" class="logo-font">conduit</a>
        <span class="attribution">
          An interactive learning project from
          <a href="https://thinkster.io">Thinkster</a>. Code &amp; design
          licensed under MIT.
        </span>
      </div>
    </footer>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}
