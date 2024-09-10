import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { markGroupAsDirty } from './services/utils';
import { AuthStore } from './stores/auth.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, InputTextModule, ButtonModule],
  template: ` <form [formGroup]="form" (ngSubmit)="saveChanges()">
    <div class="flex justify-between">
      <h1>Ajustes de perfil</h1>
      <p-button
        label="Guardar"
        type="submit"
        icon="pi pi-save"
        class="p-button-rounded"
      />
    </div>
    <div class="grid grid-cols-4 gap-4">
      <div class="input-group">
        <label for="full_name">Nombre completo</label>
        <input pInputText formControlName="full_name" id="full_name" />
      </div>
      <div class="input-group">
        <label for="username">Email</label>
        <input
          pInputText
          type="email"
          formControlName="username"
          id="username"
        />
      </div>
    </div>
  </form>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthStore);
  private messageService = inject(MessageService);

  form = new FormGroup({
    id: new FormControl('', { nonNullable: true }),
    full_name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    username: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    avatar_url: new FormControl('', { nonNullable: true }),
  });
  async ngOnInit(): Promise<void> {
    const user = this.auth.user();
    if (!user) return;
    this.form.patchValue({
      full_name: user.full_name,
      username: user.username,
      id: user.id,
    });
  }

  saveChanges() {
    if (this.form.invalid) {
      markGroupAsDirty(this.form);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete los campos requeridos',
      });
      return;
    }
    this.auth
      .updateProfile(this.form.getRawValue())
      .then(() =>
        this.messageService.add({
          severity: 'success',
          summary: 'Perfil actualizado',
          detail: 'El perfil se actualizó correctamente',
        }),
      )
      .catch(() =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el perfil',
        }),
      );
  }
}
