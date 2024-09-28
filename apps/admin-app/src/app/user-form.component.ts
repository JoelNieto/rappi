import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, DropdownModule, ButtonModule],
  template: `<form [formGroup]="form" class=" flex flex-col gap-4">
    <div class="input-group">
      <label for="full_name">Nombre</label>
      <input pInputText id="full_name" formControlName="full_name" />
    </div>
    <div class="input-group">
      <label for="username">Email</label>
      <input pInputText id="username" formControlName="username" />
    </div>
    <div class="input-group">
      <label for="role">Perfil</label>
      <p-dropdown
        id="role"
        formControlName="role"
        [options]="values"
        optionLabel="label"
        optionValue="value"
        appendTo="body"
      />
    </div>
    <div class="flex justify-end">
      <p-button label="Guardar" (onClick)="updateUser()" />
    </div>
  </form> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent implements OnInit {
  private dialog = inject(DynamicDialogConfig);
  public dialogRef = inject(DynamicDialogRef);
  private supabase = inject(SupabaseService);
  private messagesService = inject(MessageService);
  uploadedFiles: any[] = [];
  public values = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Ventas', value: 'sales' },
  ];
  form = new FormGroup({
    full_name: new FormControl('', { nonNullable: true }),
    username: new FormControl(
      { value: '', disabled: true },
      { nonNullable: true },
    ),
    role: new FormControl<'admin' | 'sales'>('sales', { nonNullable: true }),
  });

  ngOnInit(): void {
    const { user } = this.dialog.data;
    this.form.patchValue(user);
  }

  async updateUser() {
    const { user } = this.dialog.data;
    const { error } = await this.supabase.updateRole({
      userId: user.id,
      role: this.form.getRawValue().role,
    });
    if (error) {
      this.messagesService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el usuario',
      });
      console.error(error);
    } else {
      this.messagesService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Usuario actualizado',
      });
      this.dialogRef.close();
    }
  }
}
