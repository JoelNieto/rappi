import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CardModule, InputTextModule, ButtonModule],
  template: `<div class="h-svh flex justify-center items-center">
    <p-card
      class="w-1/3"
      header="Rappi Presta Admin"
      subheader="Iniciar sesion"
    >
      <div class="input-group">
        <label for="email">Email</label>
        <input id="email" pInputText type="email" />
      </div>
      <div class="flex justify-end pt-4">
        <p-button label="Iniciar sesion" />
      </div>
    </p-card>
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {}
