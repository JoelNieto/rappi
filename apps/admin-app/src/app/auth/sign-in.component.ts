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
  selector: 'app-sign-in',
  standalone: true,
  imports: [CardModule, InputTextModule, ButtonModule, ReactiveFormsModule],
  template: ` <div class="h-svh flex justify-center items-center">
    <p-card
      class=" w-full md:w-1/3 px-8"
      header="Rappi Presta Admin"
      subheader="Iniciar sesion"
    >
      <div class="input-group">
        <label for="email">Email</label>
        <input
          id="email"
          [formControl]="emailControl"
          pInputText
          type="email"
        />
      </div>
      <div class="flex justify-end pt-4">
        <p-button
          label="Iniciar sesion"
          [disabled]="emailControl.invalid"
          [loading]="loading()"
          (onClick)="signIn()"
        />
      </div>
    </p-card>
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignInComponent {
  private supabase = inject(SupabaseService);
  protected loading = signal(false);
  private message = inject(MessageService);
  public emailControl = new FormControl('', {
    validators: [Validators.required, Validators.email],
    updateOn: 'blur',
    nonNullable: true,
  });

  async signIn() {
    this.loading.set(true);
    const { error } = await this.supabase.signIn(this.emailControl.value);
    if (error) {
      console.error(error);
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
      });
      this.loading.set(false);
      return;
    }
    this.emailControl.reset();
    this.loading.set(false);
    this.message.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Revise su email para continuar',
    });
  }
}
