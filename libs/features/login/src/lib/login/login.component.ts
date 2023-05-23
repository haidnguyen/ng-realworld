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
  templateUrl: './login.component.html',
  styleUrls: ['./login.style.css'],
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
