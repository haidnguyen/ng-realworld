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
  template: `
    <div class="settings-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Your Settings</h1>

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="text"
                    placeholder="URL of profile picture"
                    formControlName="image"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="text"
                    placeholder="Your Name"
                    formControlName="username"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <textarea
                    class="form-control form-control-lg"
                    rows="8"
                    placeholder="Short bio about you"
                    formControlName="bio"
                  ></textarea>
                </fieldset>
                <fieldset class="form-group">
                  <input class="form-control form-control-lg" type="text" placeholder="Email" formControlName="email" />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="password"
                    placeholder="Password"
                    formControlName="password"
                  />
                </fieldset>
                <button class="btn btn-lg btn-primary pull-xs-right" type="submit">Update Settings</button>
              </fieldset>
            </form>
            <hr />
            <button class="btn btn-outline-danger" (click)="onLogout()">Or click here to logout.</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
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
