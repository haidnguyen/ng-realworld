import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { fromProcedure, injectTRPC, isTRPCClientError } from '@ng-realworld/data-access/trpc-client';

@Component({
  selector: 'ng-realworld-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.style.css'],
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
    fromProcedure(this.client.user.create.mutate)(formValue).subscribe({
      next: result => {
        console.log({ result });
      },
      error: err => {
        if (isTRPCClientError(err)) {
          console.log(err);
          console.log(err.data?.flatError);
        }
      },
    });
  }
}
