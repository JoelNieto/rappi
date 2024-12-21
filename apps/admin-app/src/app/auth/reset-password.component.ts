import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SupabaseService } from '../services/supabase.service';

@Component({
    selector: 'app-reset-password',
    imports: [CardModule, InputTextModule, ButtonModule, ReactiveFormsModule],
    template: `<div class="h-svh flex justify-center items-center">
    <p-card
      class="w-full md:w-1/3 px-8"
      header="Rappi Presta Admin"
      subheader="Restablecer contraseña"
    >
      <div class="flex-col flex gap-4">
        <div class="input-group">
          <label for="email">Email</label>
          <input
            id="email"
            [formControl]="emailControl"
            pInputText
            type="email"
          />
        </div>
        <div class="flex justify-end gap-4 pt-4">
          <p-button
            label="Enviar"
            (onClick)="requestResetPassword()"
            [loading]="loading()"
          />
        </div>
      </div>
    </p-card>
  </div> `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent {
  private supabase = inject(SupabaseService);
  protected loading = signal(false);
  private message = inject(MessageService);
  protected emailControl = new FormControl('', {
    validators: [Validators.required, Validators.email],
    nonNullable: true,
  });

  protected requestResetPassword() {
    if (this.emailControl.invalid) {
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El email es requerido',
      });
      return;
    }
    this.loading.set(true);
    this.supabase
      .resetPassword(this.emailControl.getRawValue())
      .then(() => {
        this.message.add({
          severity: 'success',
          summary: 'Exito',
          detail: 'Se ha enviado un correo con las instrucciones',
        });
      })
      .catch(() => {
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo enviar el correo',
        });
      })
      .finally(() => {
        this.loading.set(false);
      });
  }
}
