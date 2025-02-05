import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { DashboardStore } from './stores/dashboard.store';
@Component({
  selector: 'app-clients',
  imports: [
    TableModule,
    Button,
    DialogModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    Card,
  ],
  template: `<p-card>
    <ng-template #title> Clientes </ng-template>
    <ng-template #subtitle> Listado de clientes </ng-template>
    <p-table
      [value]="store.clientsList()"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="[5, 10, 20]"
      styleClass="p-datatable-striped"
    >
      <ng-template #caption>
        <div class="flex w-full justify-end items-center">
          <p-button
            type="button"
            label="Nuevo"
            icon="pi pi-plus"
            routerLink="new"
          />
        </div>
      </ng-template>
      <ng-template #header>
        <tr>
          <th pSortableColumn="full_name">
            Nombre <p-sortIcon field="full_name" />
          </th>
          <th pSortableColumn="document_id">
            Cedula <p-sortIcon field="document_id" />
          </th>
          <th pSortableColumn="email">Email <p-sortIcon field="email" /></th>
          <th pSortableColumn="phone_number">
            Telefono <p-sortIcon field="phone_number" />
          </th>
          <th pSortableColumn="salary">
            Salario <p-sortIcon field="salary" />
          </th>
          <th pSortableColumn="created_at">
            Creado <p-sortIcon field="created_at" />
          </th>
          <th>Acciones</th>
        </tr>
        <tr>
          <th>
            <p-columnFilter
              type="text"
              field="full_name"
              placeholder="Buscar por nombre"
              ariaLabel="Filter Name"
            />
          </th>
          <th>
            <p-columnFilter
              type="text"
              field="document_id"
              placeholder="Buscar por Nro. Doc"
              ariaLabel="Filter Document"
            />
          </th>
          <th>
            <p-columnFilter
              type="text"
              field="document_id"
              placeholder="Buscar por Nro. Doc"
              ariaLabel="Filter Document"
            />
          </th>
          <th>
            <p-columnFilter
              type="text"
              field="phone_number"
              placeholder="Buscar por telefono"
              ariaLabel="Filter Phone"
            />
          </th>
          <th>
            <p-columnFilter
              type="text"
              field="salary"
              placeholder="Buscar por salario"
              ariaLabel="Filter Salary"
            />
          </th>
          <th>
            <p-columnFilter
              type="date"
              field="created_at"
              placeholder="Buscar por fecha"
              ariaLabel="Filter Date"
            />
          </th>
          <th></th>
        </tr>
      </ng-template>
      <ng-template #body let-client>
        <tr>
          <td>{{ client.full_name }}</td>
          <td>{{ client.document_id }}</td>
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
                routerLink="{{ client.id }}"
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
