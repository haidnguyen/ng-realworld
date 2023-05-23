import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@ng-realworld/data-access/service';
import { fromProcedure, injectTRPC } from '@ng-realworld/data-access/trpc-client';

@Component({
  selector: 'ng-realworld-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.style.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly client = injectTRPC();

  readonly form = this.formBuilder.group({
    image: this.formBuilder.control<string | null>(''),
    username: this.formBuilder.control(''),
    bio: this.formBuilder.control(''),
    email: this.formBuilder.control(''),
    password: this.formBuilder.control(''),
  });

  private readonly patchFormEffect = effect(() => {
    const user = this.authService.currentUser();

    if (!user) {
      return;
    }
    this.form.patchValue({
      image: user.image,
      username: user.username,
      bio: user.bio,
      email: user.email,
    });
  });

  onLogout() {
    this.authService.logout();
    this.router.navigate(['home']);
  }

  onSubmit() {
    const formValue = this.form.getRawValue();

    fromProcedure(this.client.user.update.mutate)(formValue).subscribe(() => {
      console.log('update success');
    });
  }
}
