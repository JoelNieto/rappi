import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DashboardStore } from './stores/dashboard.store';
@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    CardModule,
  ],
  template: `<p-card>
    <div class="flex items-center justify-between">
      <h1>Clientes</h1>

      <p-button
        type="button"
        label="Nuevo"
        icon="pi pi-plus"
        routerLink="new"
      />
    </div>
    <p-table
      [value]="store.clients()"
      [paginator]="true"
      [rows]="10"
      styleClass="p-datatable-striped"
    >
      <ng-template pTemplate="header">
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Telefono</th>
          <th>Salario</th>
          <th>Creado</th>
          <th>Acciones</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-client>
        <tr>
          <td>{{ client.first_name }} {{ client.last_name }}</td>
          <td>{{ client.email }}</td>
          <td>{{ client.phone_number }}</td>
          <td>{{ client.salary | currency: '$' }}</td>
          <td>{{ client.created_at | date: 'medium' }}</td>
          <td>
            <div class="flex gap-2">
              <p-button
                text
                rounded
                outlined
                severity="success"
                icon="pi pi-pencil"
                [routerLink]="client.id"
              />
              <p-button
                text
                rounded
                outlined
                severity="danger"
                icon="pi pi-trash"
                (onClick)="store.deleteClient(client.id)"
              />
            </div>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </p-card> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsComponent {
  protected store = inject(DashboardStore);
}
