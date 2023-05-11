import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '@ng-realworld/ui/layout';

@Component({
  standalone: true,
  imports: [RouterModule, LayoutComponent],
  selector: 'ng-realworld-root',
  template: `
    <ng-realworld-layout>
      <router-outlet />
    </ng-realworld-layout>
  `,
  styles: [],
})
export class AppComponent {
  title = 'conduit';
}
