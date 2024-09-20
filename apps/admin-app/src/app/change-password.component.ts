import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CardModule, PasswordModule, ReactiveFormsModule],
  template: `<p-card header="Cambiar contrasena">
    <p-password />
  </p-card>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordComponent {}
