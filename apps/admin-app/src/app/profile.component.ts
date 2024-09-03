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
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, InputTextModule],
  template: `<p-card header="Ajustes de perfil">
    <form [formGroup]="form" class="flex gap-4">
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
    </form>
  </p-card>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private supabase = inject(SupabaseService);

  form = new FormGroup({
    full_name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    username: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
  });
  async ngOnInit(): Promise<void> {
    const session = await this.supabase.currentSession();
    const profile = await this.supabase.profile();
    if (profile) {
      this.form.patchValue(profile);
    }
  }
}
