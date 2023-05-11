import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'ng-realworld-layout',
  standalone: true,
  template: `
    <ng-realworld-header />
    <ng-content />
    <ng-realworld-footer />
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeaderComponent, FooterComponent],
})
export class LayoutComponent {}
