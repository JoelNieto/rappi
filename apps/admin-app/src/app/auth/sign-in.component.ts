import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { markGroupAsDirty } from '../services/utils';
import { AuthStore } from '../stores/auth.store';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CardModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    PasswordModule,
    RouterLink,
  ],
  template: ` <form
    [formGroup]="signInForm"
    (ngSubmit)="signIn()"
    class="h-svh flex justify-center items-center bg-slate-50"
  >
    <p-card
      class="w-full md:w-1/2 px-8 "
      header="Rappi Presta Admin"
      subheader="Iniciar sesion"
    >
      <div class="flex-col flex gap-4">
        <div class="input-group">
          <label for="email">Email</label>
          <input
            id="email"
            formControlName="email"
            pInputText
            type="email"
            placeholder="Email del usuario"
          />
        </div>
        <div class="input-group">
          <label for="password">Contraseña</label>
          <p-password
            [feedback]="false"
            formControlName="password"
            placeholder="********"
          />
        </div>
        <div class="flex flex-col md:flex-row justify-end gap-4 pt-4">
          <p-button
            class="w-full md:w-auto"
            link
            label="Olvide mi contraseña"
            routerLink="/reset-password"
          />
          <p-button
            class="w-full md:w-auto"
            label="Iniciar sesion"
            [loading]="loading()"
            type="submit"
          />
        </div>
      </div>
    </p-card>
  </form>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignInComponent {
  private auth = inject(AuthStore);
  protected loading = signal(false);
  private message = inject(MessageService);
  protected signInForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    password: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  async signIn() {
    if (!this.signInForm.valid) {
      markGroupAsDirty(this.signInForm);
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Revise los campos',
      });
      return;
    }
    this.loading.set(true);
    const { email, password } = this.signInForm.getRawValue();
    try {
      await this.auth.signIn({ email, password });
      this.message.add({
        severity: 'success',
        summary: 'Exito',
        detail: 'Bienvenido',
      });
    } catch (error) {
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Algo salio mal',
      });
    } finally {
      this.signInForm.reset();
      this.loading.set(false);
    }
  }
}
