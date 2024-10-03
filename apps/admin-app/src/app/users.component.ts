import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Profile } from '@rappi/models';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { RolePipe } from './role.pipe';
import { SupabaseService } from './services/supabase.service';
import { DashboardStore } from './stores/dashboard.store';
import { UserFormComponent } from './user-form.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CardModule,
    TableModule,
    RolePipe,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule,
  ],
  providers: [DynamicDialogRef, DialogService],
  template: `<p-card header="Usuario" subheader="Administracion de accesos">
      <div class="flex justify-end">
        <p-button
          label="Invitar usuario"
          icon="pi pi-plus"
          (onClick)="inviteUser()"
        />
      </div>
      <p-table [value]="users()" styleClass="p-datatable-striped">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="full_name">
              Nombre <p-sortIcon field="full_name" />
            </th>
            <th pSortableColumn="username">
              Email <p-sortIcon field="username" />
            </th>
            <th pSortableColumn="role">Perfil<p-sortIcon field="role" /></th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-user>
          <tr>
            <td>{{ user.full_name }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.role | role }}</td>
            <td class="flex gap-2">
              <p-button
                rounded
                text
                outlined
                severity="success"
                icon="pi pi-pencil"
                (onClick)="editUser(user)"
              />
              <p-button
                rounded
                text
                outlined
                severity="danger"
                icon="pi pi-trash"
                (onClick)="store.deleteUser(user.id)"
              />
            </td>
          </tr>
        </ng-template>
      </p-table>
    </p-card>
    <p-dialog
      modal
      [(visible)]="showDialog"
      header="Invitar usuario"
      [style]="{ width: '25rem' }"
    >
      <div class="input-group mb-2">
        <label for="email">Email</label>
        <input
          pInputText
          type="email"
          id="email"
          [formControl]="inviteEmailControl"
        />
      </div>
      <div class="flex justify-end gap-2">
        <p-button
          label="Invitar"
          icon="pi pi-check"
          [loading]="loading()"
          (onClick)="invite()"
        />
      </div>
    </p-dialog> `,

  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  protected loading = signal(false);
  private message = inject(MessageService);
  protected showDialog = false;
  private supabase = inject(SupabaseService);
  protected store = inject(DashboardStore);
  private dialogService = inject(DialogService);
  protected users = this.store.users;

  protected inviteEmailControl = new FormControl('', {
    validators: [Validators.required, Validators.email],
    nonNullable: true,
  });

  protected inviteUser() {
    this.showDialog = true;
  }

  protected editUser(user: Partial<Profile>) {
    this.dialogService.open(UserFormComponent, {
      header: 'Editar usuario',
      width: '35vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
      data: { user },
    });
  }

  protected invite() {
    if (!this.inviteEmailControl.valid) {
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Agregue un email valido',
      });
      return;
    }
    this.loading.set(true);
    this.supabase
      .inviteUser(this.inviteEmailControl.getRawValue())
      .then(({ error }) => {
        if (error) {
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
          });
          return;
        }
        this.message.add({
          severity: 'success',
          summary: 'Exito',
          detail: 'Usuario invitado',
        });
        this.showDialog = false;
        this.store.fetchUsers();
      })
      .catch((error) => {
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message,
        });
      })
      .finally(() => this.loading.set(false));
  }
}
