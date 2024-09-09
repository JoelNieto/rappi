import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Installment, InstallmentStatus, PaymentMethod } from '@rappi/models';
import { isBefore } from 'date-fns';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { PaymentFormComponent } from './payment-form.component';
import { DashboardStore } from './stores/dashboard.store';

@Component({
  selector: 'app-loan-details',
  standalone: true,
  imports: [
    SkeletonModule,
    DatePipe,
    CurrencyPipe,
    TableModule,
    ButtonModule,
    RouterLink,
    TabViewModule,
    TagModule,
  ],
  providers: [DynamicDialogRef, DialogService],
  template: `@if (store.loading()) {
      <p-skeleton styleClass="mb-2" />
      <p-skeleton width="10rem" styleClass="mb-2" />
      <p-skeleton width="5rem" styleClass="mb-2" />
      <p-skeleton height="2rem" styleClass="mb-2" />
      <p-skeleton width="10rem" height="4rem" />
    } @else {
      @let loan = store.currentLoan();
      @if (loan) {
        <div class="flex items-center justify-between">
          <h1>Detalle de prestamo #{{ loan.id }}</h1>
          <div class="flex gap-2">
            <p-button
              type="button"
              label="Volver"
              icon="pi pi-arrow-left"
              routerLink="/loans"
              outlined
              severity="secondary"
            />
            <p-button
              type="button"
              label="Registrar pago"
              icon="pi pi-money-bill"
              severity="success"
              (onClick)="registerPayment()"
            />
          </div>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <h2 class="mb-1 font-normal text-slate-500">Cliente</h2>
            <p>
              {{ loan.client?.first_name }}
              {{ loan?.client?.last_name }}
            </p>
          </div>
          <div>
            <h2 class="mb-1 font-normal text-slate-500">Producto</h2>
            <p>{{ loan!.product }}</p>
          </div>
          <div>
            <h2 class="mb-1 font-normal text-slate-500">Comercio</h2>
            <p>{{ loan.commerce }}</p>
          </div>
          <div>
            <h2 class="mb-1 font-normal text-slate-500">Monto</h2>
            <p>{{ loan.price_base | currency: '$' }}</p>
          </div>
          <div>
            <h2 class="mb-1 font-normal text-slate-500">Monto Vencido</h2>
            <p>{{ overDueAmount() | currency: '$' }}</p>
          </div>
          <div>
            <h2 class="mb-1 font-normal text-slate-500">Fecha de creación</h2>
            <p>{{ loan.created_at | date: 'dd/MM/yyyy' }}</p>
          </div>
        </div>
        <p-tabView>
          <p-tabPanel header="Historial de pagos">
            @if (loan.payments) {
              <p-table
                [value]="loan.payments"
                styleClass="p-datatable-striped p-datatable-gridlines"
              >
                <ng-template pTemplate="header">
                  <tr>
                    <th>Fecha de pago</th>
                    <th>Monto</th>
                    <th>Referencia</th>
                    <th>Metodo de pago</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-payment>
                  <tr>
                    <td>{{ payment.payment_date | date: 'mediumDate' }}</td>
                    <td>{{ payment.amount | currency: '$' }}</td>
                    <td>{{ payment.reference }}</td>
                    <td>{{ payment.payment_method }}</td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="4">Sin pagos registrados</td>
                  </tr>
                </ng-template>
              </p-table>
            }
          </p-tabPanel>
          <p-tabPanel header="Cuotas">
            <p-table
              [value]="loan.installments"
              styleClass="p-datatable-striped p-datatable-gridlines"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>#</th>
                  <th>Fecha de pago</th>
                  <th>Monto</th>
                  <th>Pagado</th>
                  <th>Saldo</th>
                  <th>Estado</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-installment>
                @let balance = installment.amount - installment.paid_amount;

                <tr>
                  <td>{{ installment.seq }}</td>
                  <td>{{ installment.due_date | date: 'mediumDate' }}</td>
                  <td>{{ installment.amount | currency: '$' }}</td>
                  <td>{{ installment.paid_amount | currency: '$' }}</td>
                  <td>
                    {{ balance | currency: '$' }}
                  </td>
                  <td>
                    @switch (isDueDate(installment)) {
                      @case (status.Paid) {
                        <p-tag value="Pagado" severity="success" rounded />
                      }
                      @case (status.Pending) {
                        <p-tag value="Pendiente" severity="secondary" rounded />
                      }
                      @case (status.Overdue) {
                        <p-tag value="Vencido" severity="danger" rounded />
                      }
                    }
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabPanel>
        </p-tabView>
      }
    } `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanDetailsComponent implements OnInit, OnDestroy {
  protected store = inject(DashboardStore);
  public loanId = input.required<string>();
  ref = inject(DynamicDialogRef);
  dialogService = inject(DialogService);
  public method = PaymentMethod;
  public status = InstallmentStatus;

  protected overDueAmount = computed(() =>
    this.store
      .currentLoan()
      ?.installments.reduce((acc: number, installment: Installment) => {
        if (this.isDueDate(installment) === InstallmentStatus.Overdue) {
          return acc + installment.amount - installment.paid_amount;
        }
        return acc;
      }, 0),
  );

  ngOnInit(): void {
    this.store.setCurrentLoan(Number(this.loanId()));
  }

  protected isDueDate(installment: Installment) {
    if (installment.paid_amount === installment.amount) {
      return InstallmentStatus.Paid;
    }

    if (isBefore(new Date(), installment.due_date)) {
      return InstallmentStatus.Pending;
    }
    return InstallmentStatus.Overdue;
  }

  registerPayment() {
    this.ref = this.dialogService.open(PaymentFormComponent, {
      header: 'Registrar pago',
      width: '50vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
  }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close();
    }
  }
}
