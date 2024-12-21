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
import { format } from 'date-fns';
import { FilterService } from 'primeng/api';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { utils, writeFile } from 'xlsx';
import { DashboardStore } from './stores/dashboard.store';
import { PaymentsStore } from './stores/payments.store';

@Component({
  selector: 'app-payments',
  imports: [
    TableModule,
    CalendarModule,
    CardModule,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    DropdownModule,
    RouterLink,
    Button,
  ],
  template: `<p-card header="Pagos">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="input-group">
        <label for="startDate">Filtro de fecha</label>
        <p-calendar
          selectionMode="range"
          class="mb-2"
          [ngModel]="range"
          (ngModelChange)="onRangeChange($event)"
          readonlyInput
        />
      </div>
      <div class="input-group">
        <label for="status">Vendedor</label>
        <p-dropdown
          placeholder="--Todos--"
          [options]="dashboard.users()"
          (onChange)="store.updateAgent($event.value)"
          optionValue="id"
          optionLabel="full_name"
          showClear
        />
      </div>
      <div class="flex flex-col justify-between">
        <label for="status">Monto total</label>
        <p class="mb-3 text-xl">{{ store.total() | currency }}</p>
      </div>
      <div class="flex items-center gap-2 ">
        <p-button
          icon="pi pi-file-excel"
          label="Exportar"
          severity="success"
          (onClick)="generateReport()"
        />
      </div>
    </div>

    <p-table [value]="payments()" [paginator]="true" [rows]="10">
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="payment_date">
            Fecha <p-sortIcon field="payment_date" />
          </th>
          <th pSortableColumn="loan.id">
            Prestamo <p-sortIcon field="loan" />
          </th>
          <th pSortableColumn="loan.agent.full_name">
            Vendedor <p-sortIcon field="loan.agent" />
          </th>
          <th pSortableColumn="reference">
            Referencia <p-sortIcon field="reference" />
          </th>
          <th pSortableColumn="client.first_name">
            Cliente <p-sortIcon field="client" />
          </th>
          <th pSortableColumn="amount">Valor <p-sortIcon field="amount" /></th>
        </tr>
        <tr>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
          <th>
            <p-columnFilter
              type="text"
              field="loan.client"
              matchMode="client-filter"
              placeholder="Buscar por cliente"
              ariaLabel="Filter Commerce"
              [showMenu]="false"
            />
          </th>
          <th></th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-payment>
        <tr>
          @let loan = payment.loan;
          @let client = loan.client;
          <td>{{ payment.payment_date | date: 'shortDate' }}</td>
          <td>
            <a routerLink="/loans/{{ payment.loan.id }}" class="pill">{{
              payment.loan.id
            }}</a>
          </td>
          <td>{{ loan.agent.full_name }}</td>
          <td>{{ payment.reference }}</td>
          <td>
            <a routerLink="/clients/{{ client.id }}" class="link"
              >{{ client.first_name }} {{ client.last_name }}</a
            >
          </td>
          <td>{{ payment.amount | currency }}</td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="5" class="text-center">Sin pagos registrados</td>
        </tr>
      </ng-template>
    </p-table>
  </p-card>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent implements OnInit {
  protected store = inject(PaymentsStore);
  protected dashboard = inject(DashboardStore);
  protected range = [this.store.startDate(), this.store.endDate()];
  private filterService = inject(FilterService);
  public payments = computed(() => [...this.store.payments()]);

  ngOnInit(): void {
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
  }

  protected async onRangeChange(dates: Date[]) {
    if (!dates || !dates[1]) {
      return;
    }
    this.store.updateDates(dates[0], dates[1]);
  }

  generateReport() {
    const items = this.store.payments().map((payment) => ({
      Fecha: payment.payment_date,
      Prestamo: payment.loan?.id,
      Vendedor: payment.loan?.agent?.full_name,
      Referencia: payment.reference,
      Cliente: `${payment.loan?.client?.first_name} ${payment.loan?.client?.last_name}`,
      Valor: payment.amount,
    }));
    const ws = utils.json_to_sheet(items);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, `PAGOS`);
    writeFile(
      wb,
      `PAGOS_${format(this.store.startDate(), 'dd_MM_YYY')}_${format(this.store.endDate(), 'dd_MM_YYYY')}.xlsx`,
    );
  }
}
