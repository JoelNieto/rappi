import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DashboardStore } from './stores/dashboard.store';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [
    ButtonModule,
    TableModule,
    RouterLink,
    DatePipe,
    CurrencyPipe,
    CardModule,
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
      [value]="store.loans()"
      [paginator]="true"
      [rows]="10"
      styleClass="p-datatable-striped"
    >
      <ng-template pTemplate="header">
        <tr>
          <th>#</th>
          <th>Comercio</th>
          <th>Cliente</th>
          <th>Fecha de creación</th>
          <th>Monto</th>
          <th>Asignado a</th>
          <th>Acciones</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-loan>
        <tr>
          <td>{{ loan.id }}</td>
          <td>{{ loan.commerce }}</td>
          <td>{{ loan.client?.first_name }} {{ loan.client?.last_name }}</td>
          <td>{{ loan.created_at | date: 'dd/MM/yyyy' }}</td>
          <td>{{ loan.price_base | currency }}</td>
          <td>{{ loan.agent.full_name ?? loan.agent.username }}</td>
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

  ngOnInit(): void {
    this.store.setCurrentLoan(null);
    this.store.fetchLoans();
  }

  deleteLoan(id: number) {
    this.store.deleteLoan(id);
  }
}
