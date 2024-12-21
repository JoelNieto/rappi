import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Client } from '@rappi/models';
import { FilterService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { DashboardStore } from './stores/dashboard.store';

@Component({
  selector: 'app-loans',
  imports: [
    ButtonModule,
    TableModule,
    RouterLink,
    DatePipe,
    CurrencyPipe,
    CardModule,
    MultiSelectModule,
    FormsModule,
  ],
  template: `<p-card>
    <ng-template pTemplate="header">
      <div class="p-card-title flex justify-between items-center p-5 pb-0 mb-0">
        Prestamos
        <p-button
          type="button"
          label="Nuevo"
          icon="pi pi-plus"
          routerLink="new"
        />
      </div>
    </ng-template>
    <p-table
      [value]="loans()"
      [paginator]="true"
      [rows]="10"
      styleClass="p-datatable-striped"
      [rowsPerPageOptions]="[5, 10, 20]"
      [tableStyle]="{ 'min-width': '75rem' }"
    >
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="id" style="width:22%">
            # <p-sortIcon field="id" />
          </th>
          <th pSortableColumn="commerce">
            Comercio <p-sortIcon field="commerce" />
          </th>
          <th pSortableColumn="client.first_name">
            Cliente <p-sortIcon field="client" />
          </th>
          <th pSortableColumn="created_at">
            Fecha de creación <p-sortIcon field="created_at" />
          </th>
          <th pSortableColumn="price_base">
            Monto <p-sortIcon field="price_base" />
          </th>
          <th pSortableColumn="balance">
            Saldo <p-sortIcon field="balance" />
          </th>
          <th pSortableColumn="agent.full_name">
            Asignado a <p-sortIcon field="agent" />
          </th>
          <th>Acciones</th>
        </tr>
        <tr>
          <th>
            <p-columnFilter
              type="text"
              field="id"
              placeholder="Buscar por id"
              ariaLabel="Filter ID"
            />
          </th>
          <th>
            <p-columnFilter
              type="text"
              field="commerce"
              placeholder="Buscar por comercio"
              ariaLabel="Filter Commerce"
              [showMenu]="false"
            />
          </th>
          <th>
            <p-columnFilter
              type="text"
              field="client"
              matchMode="client-filter"
              placeholder="Buscar por cliente"
              ariaLabel="Filter Commerce"
              [showMenu]="false"
            />
          </th>

          <th></th>
          <th></th>
          <th></th>
          <th>
            <p-columnFilter
              field="agent"
              matchMode="custom-filter"
              [showMenu]="false"
            >
              <ng-template
                pTemplate="filter"
                let-value
                let-filter="filterCallback"
              >
                <p-multiSelect
                  [ngModel]="value"
                  [options]="store.users()"
                  placeholder="TODOS"
                  (onChange)="filter($event.value)"
                  optionLabel="full_name"
                  appendTo="body"
                />
              </ng-template>
            </p-columnFilter>
          </th>
          <th></th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-loan>
        <tr>
          <td>{{ loan.id }}</td>
          <td>{{ loan.commerce }}</td>
          <td>
            <a routerLink="/clients/{{ loan.client?.id }}" class="pill"
              >{{ loan.client?.first_name }} {{ loan.client?.last_name }}</a
            >
          </td>
          <td>{{ loan.created_at | date: 'dd/MM/yyyy' }}</td>
          <td>{{ loan.price_base | currency }}</td>
          <td>{{ loan.balance | currency }}</td>
          <td>{{ loan.agent?.full_name ?? loan.agent?.username }}</td>
          <td>
            <div class="flex gap-2">
              <p-button
                rounded
                severity="success"
                text
                outlined
                icon="pi pi-eye"
                routerLink="{{ loan.id }}"
              />
              <p-button
                rounded
                severity="danger"
                text
                outlined
                icon="pi pi-trash"
                (onClick)="deleteLoan(loan.id)"
              />
            </div>
          </td>
        </tr> </ng-template
    ></p-table>
  </p-card> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoansComponent implements OnInit {
  protected store = inject(DashboardStore);
  private filterService = inject(FilterService);
  public loans = computed(() => [...this.store.loans()]);

  ngOnInit(): void {
    this.filterService.register(
      'custom-filter',
      (value: { id: any } | null | undefined, filter: any[]) => {
        if (filter === undefined || filter === null || !filter.length) {
          return true;
        }

        if (value === undefined || value === null) {
          return false;
        }

        return filter.map((x) => x.id).includes(value.id);
      },
    );

    this.filterService.register(
      'client-filter',
      (value: Partial<Client>, filter: string) => {
        if (filter === undefined || filter === null || !filter.length) {
          return true;
        }

        if (value === undefined || value === null) {
          return false;
        }
        return (
          value.first_name?.toLowerCase().includes(filter.toLowerCase()) ||
          value.last_name?.toLowerCase().includes(filter.toLowerCase())
        );
      },
    );
    this.store.setCurrentLoan(null);
    this.store.fetchLoans();
  }

  deleteLoan(id: number) {
    this.store.deleteLoan(id);
  }
}
