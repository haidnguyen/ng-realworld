import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { fromProcedure, injectTRPC } from '@ng-realworld/data-access/trpc-client';

@Component({
  selector: 'ng-realworld-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Sign up</h1>
            <p class="text-xs-center">
              <a routerLink="/login">Have an account?</a>
            </p>

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <fieldset class="form-group">
                <input
                  class="form-control form-control-lg"
                  type="text"
                  placeholder="Your Name"
                  formControlName="username"
                />
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
export class RegisterComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly client = injectTRPC();

  readonly form = this.formBuilder.group({
    username: this.formBuilder.control('', [Validators.required]),
    email: this.formBuilder.control('', [Validators.required]),
    password: this.formBuilder.control('', [Validators.required]),
  });

  onSubmit() {
    const formValue = this.form.getRawValue();
    console.log({ formValue });
    fromProcedure(this.client.user.createUser.mutate)(formValue).subscribe({
      next: result => {
        console.log({ result });
      },
      error: err => {
        console.log({ err });
      },
    });
  }
}
