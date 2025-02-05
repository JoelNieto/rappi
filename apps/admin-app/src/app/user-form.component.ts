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
import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DashboardStore } from './stores/dashboard.store';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, InputText, Select, Button],
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
      <p-select
        id="role"
        formControlName="role"
        [options]="values"
        optionLabel="label"
        optionValue="value"
        appendTo="body"
      />
    </div>
    <div class="flex gap-2 justify-end">
      <p-button
        label="Cancelar"
        [loading]="store.loading()"
        severity="secondary"
        (onClick)="dialogRef.close()"
        icon="pi pi-times"
      />
      <p-button
        label="Guardar"
        [loading]="store.loading()"
        (onClick)="updateUser()"
        icon="pi pi-save"
      />
    </div>
  </form> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent implements OnInit {
  private dialog = inject(DynamicDialogConfig);
  public dialogRef = inject(DynamicDialogRef);
  private messagesService = inject(MessageService);
  protected store = inject(DashboardStore);
  uploadedFiles: any[] = [];
  public values = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Ventas', value: 'sales' },
  ];
  form = new FormGroup({
    full_name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    role: new FormControl<'admin' | 'sales'>('sales', { nonNullable: true }),
  });

  ngOnInit(): void {
    const { user } = this.dialog.data;
    this.form.patchValue(user);
  }

  async updateUser() {
    if (this.form.pristine) {
      this.messagesService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No ha realizado cambios',
      });
      return;
    }

    if (!this.form.valid) {
      this.messagesService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, rellena los campos',
      });
      return;
    }

    const { user } = this.dialog.data;
    const { username, full_name, role } = this.form.getRawValue();
    this.store
      .saveUser({ userId: user.id, username, full_name, role })
      .then(() => {
        this.dialogRef.close();
      });
  }
}
