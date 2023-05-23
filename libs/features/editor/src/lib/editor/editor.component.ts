import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { fromProcedure, injectTRPC } from '@ng-realworld/data-access/trpc-client';

@Component({
  selector: 'ng-realworld-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.style.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly client = injectTRPC();

  readonly form = this.formBuilder.group({
    title: this.formBuilder.control(''),
    description: this.formBuilder.control(''),
    body: this.formBuilder.control(''),
    tags: this.formBuilder.control(''),
  });

  onSubmit() {
    const formValue = this.form.getRawValue();
    const tags = formValue.tags.split(',').map(tag => tag.trim());

    fromProcedure(this.client.article.add.mutate)({
      title: formValue.title,
      description: formValue.description,
      body: formValue.body,
      tags,
    }).subscribe(article => {
      console.log({ article });
    });
  }
}
