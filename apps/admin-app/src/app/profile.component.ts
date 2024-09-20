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
import { PasswordModule } from 'primeng/password';
import { markGroupAsDirty } from './services/utils';
import { AuthStore } from './stores/auth.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="saveChanges()" class="mb-4">
      <p-card
        header=" Ajustes de perfil"
        subheader="Actualice su informacion personal"
      >
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
        <div class="flex justify-end gap-2">
          <p-button label="Guardar" type="submit" icon="pi pi-save" />
        </div>
      </p-card>
    </form>
    <p-card header="Cambiar contraseña">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div class="input-group">
          <label for="password">Nueva contraseña</label>
          <p-password
            [formControl]="passwordControl"
            showTransitionOptions
            showClear
            toggleMask
          />
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <p-button
          label="Guardar"
          icon="pi pi-save"
          (onClick)="changePassword()"
        />
      </div>
    </p-card>
  `,
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

  passwordControl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(6)],
    nonNullable: true,
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
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Perfil actualizado',
          detail: 'El perfil se actualizó correctamente',
        });
        this.form.markAsPristine();
      })
      .catch(() =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el perfil',
        }),
      );
  }

  changePassword() {
    if (this.passwordControl.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña debe tener al menos 6 caracteres',
      });
      return;
    }
    this.auth
      .changePassword(this.passwordControl.getRawValue())
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Contraseña actualizada',
          detail: 'La contraseña se actualizó correctamente',
        });
        this.passwordControl.reset();
      })
      .catch(() =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar la contraseña',
        }),
      );
  }
}
