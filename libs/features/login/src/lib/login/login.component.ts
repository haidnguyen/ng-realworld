import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@ng-realworld/data-access/service';
import { fromProcedure, injectTRPC, isTRPCClientError } from '@ng-realworld/data-access/trpc-client';

@Component({
  selector: 'ng-realworld-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Sign up</h1>
            <p class="text-xs-center">
              <a routerLink="/register">Need an account?</a>
            </p>

            <!-- <ul class="error-messages">
              <li>That email is already taken</li>
            </ul> -->

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
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
              <button class="btn btn-lg btn-primary pull-xs-right" [disabled]="form.invalid">Sign up</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly client = injectTRPC();
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.group({
    email: this.formBuilder.control('', [Validators.required]),
    password: this.formBuilder.control('', [Validators.required]),
  });

  onSubmit() {
    const formValue = this.form.getRawValue();
    fromProcedure(this.client.user.login.mutate)(formValue).subscribe({
      next: result => {
        this.authService.authenticated(result.user);
        this.authService.registerToken(result.token);
        this.router.navigate(['setting']);
      },
      error: err => {
        if (isTRPCClientError(err)) {
          console.log({ err });
        }
      },
    });
  }
}
