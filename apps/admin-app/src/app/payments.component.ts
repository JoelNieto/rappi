import { CurrencyPipe, DatePipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { paymentsStore } from './stores/payments.store';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    TableModule,
    CalendarModule,
    CardModule,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    JsonPipe,
  ],
  template: `<p-card header="Pagos">
    <div class="grid grid-cols-1 md:grid-cols-4">
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
    </div>

    <p-table [value]="store.payments()">
      <ng-template pTemplate="header">
        <tr>
          <th>Fecha</th>
          <th>Prestamo</th>
          <th>Referencia</th>
          <th>Cliente</th>
          <th>Valor</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-payment>
        <tr>
          @let loan = payment.loan;
          @let client = loan.client;
          <td>{{ payment.payment_date | date: 'shortDate' }}</td>
          <td>{{ payment.loan.id }}</td>
          <td>{{ payment.reference }}</td>
          <td>{{ client.first_name }} {{ client.last_name }}</td>
          <td>{{ payment.amount | currency }}</td>
        </tr>
      </ng-template>
    </p-table>
  </p-card>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent {
  protected store = inject(paymentsStore);
  protected range = [this.store.startDate(), this.store.endDate()];

  protected async onRangeChange(dates: Date[]) {
    if (!dates || !dates[1]) {
      return;
    }
    this.store.updateDates(dates[0], dates[1]);
  }
}
