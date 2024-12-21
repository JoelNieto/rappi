import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SupabaseService } from '../services/supabase.service';

@Component({
    selector: 'app-change-password',
    imports: [
        CardModule,
        ButtonModule,
        PasswordModule,
        InputTextModule,
        ReactiveFormsModule,
    ],
    template: `<div class="h-svh flex justify-center items-center">
    <p-card
      class="w-full md:w-1/3 px-8"
      header="Rappi Presta Admin"
      subheader="Ingrese su nueva contraseña"
    >
      <div class="flex-col flex gap-4">
        <div class="input-group">
          <label for="email">Nueva contraseña</label>
          <p-password
            feedback
            toggleMask
            showClear
            [formControl]="newPassword"
          />
        </div>
        <div class="flex justify-end gap-4 pt-4">
          <p-button
            label="Enviar"
            (onClick)="updatePassword()"
            [loading]="loading()"
          />
        </div>
      </div>
    </p-card>
  </div>`,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent {
  loading = signal(false);
  private message = inject(MessageService);
  private supabase = inject(SupabaseService);
  protected newPassword = new FormControl('', {
    validators: [Validators.required, Validators.minLength(8)],
    nonNullable: true,
  });
  private router = inject(Router);

  updatePassword() {
    if (this.newPassword.invalid) {
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña es requerida',
      });
      return;
    }
    this.loading.set(true);
    this.supabase
      .changePassword(this.newPassword.getRawValue())
      .then(() => {
        this.message.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Contraseña actualizada',
        });
        this.router.navigate(['/']);
      })
      .catch((error) => {
        console.error(error);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar la contraseña',
        });
      })
      .finally(() => this.loading.set(false));
    // Update the password
  }
}
