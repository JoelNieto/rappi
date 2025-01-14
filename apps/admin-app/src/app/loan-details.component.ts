import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Installment,
  InstallmentStatus,
  Loan,
  Payment,
  PaymentMethod,
} from '@rappi/models';
import { isBefore } from 'date-fns';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { DocGeneratorsService } from './doc-generators.service';
import { PaymentFormComponent } from './payment-form.component';
import { FileUrlPipe } from './pipes/file-url.pipe';
import { DashboardStore } from './stores/dashboard.store';

@Component({
  selector: 'app-loan-details',
  imports: [
    Skeleton,
    DatePipe,
    CurrencyPipe,
    TableModule,
    Button,
    RouterLink,
    TabsModule,
    Select,
    Tag,
    Card,
    AsyncPipe,
    FileUrlPipe,
    FormsModule,
  ],
  providers: [DynamicDialogRef, DialogService],
  template: `@if (store.loading()) {
      <p-card>
        <p-skeleton styleClass="mb-2" />
        <p-skeleton width="10rem" styleClass="mb-2" />
        <p-skeleton width="5rem" styleClass="mb-2" />
        <p-skeleton height="2rem" styleClass="mb-2" />
        <p-skeleton width="10rem" height="4rem" />
      </p-card>
    } @else {
      @let loan = store.currentLoan();

      @if (loan) {
        @let client = loan.client;
        <p-card>
          <div class="flex flex-col md:flex-row items-center justify-between">
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
                icon="pi pi-print"
                outlined
                (onClick)="printLoan(loan)"
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
              <a class="link" routerLink="/clients/{{ client?.id }}">
                {{ client?.first_name }}
                {{ client?.last_name }}
              </a>
            </div>

            <div>
              <h2 class="mb-1 font-normal text-slate-500">Comercio</h2>
              <p>{{ loan.commerce }}</p>
            </div>
            <div>
              <h2 class="mb-0 font-normal text-slate-500">Monto financiado</h2>
              <p>{{ loan.price_base | currency }}</p>
            </div>
            <div>
              <h2 class="mb-0 font-normal text-slate-500">Intereses</h2>
              <p>{{ loan.rates_amount | currency }}</p>
            </div>
            <div>
              <h2 class="mb-0 font-normal text-slate-500">Saldo a la fecha</h2>
              <p>{{ loan.balance | currency }}</p>
            </div>
            <div>
              <h2 class="mb-1 font-normal text-slate-500">Monto Vencido</h2>
              <p>{{ overDueAmount() | currency }}</p>
            </div>
            <div>
              <h2 class="mb-1 font-normal text-slate-500">Fecha de creación</h2>
              <p>{{ loan.created_at | date: 'dd/MM/yyyy' }}</p>
            </div>
            <div class="input-group">
              <label for="user">Vendedor</label>
              <p-select
                [options]="store.users()"
                [ngModel]="loan.created_by"
                optionValue="id"
                optionLabel="full_name"
                placeholder="Seleccione un vendedor"
                filter
                showClear
                (ngModelChange)="updateLoanAssignee($event)"
              />
            </div>
          </div>
          <p class="text-lg font-semibold">Productos</p>
          <p-table
            [value]="loan?.products || []"
            styleClass=" p-datatable-gridlines"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>Producto</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Cantidad</th>
                <th>Precio</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-product>
              <tr>
                <td>{{ product.description }}</td>
                <td>{{ product.brand }}</td>
                <td>{{ product.model }}</td>
                <td>{{ product.quantity }}</td>
                <td>{{ product.price_base | currency }}</td>
              </tr>
            </ng-template>
          </p-table>
          <p-tabs value="0">
            <p-tablist>
              <p-tab value="0">Historial de pagos</p-tab>
              <p-tab value="1">Cuotas</p-tab>
            </p-tablist>
            <p-tabpanels>
              <p-tabpanel value="0">
                @if (loan.payments) {
                  <p-table
                    [value]="loan.payments"
                    styleClass="p-datatable-striped"
                  >
                    <ng-template pTemplate="header">
                      <tr>
                        <th>Fecha de pago</th>
                        <th>Monto</th>
                        <th>Referencia</th>
                        <th>Metodo de pago</th>
                        <th>Comprobante</th>
                        <th></th>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-payment>
                      <tr>
                        <td>{{ payment.payment_date | date: 'mediumDate' }}</td>
                        <td>{{ payment.amount | currency }}</td>
                        <td>{{ payment.reference }}</td>
                        <td>{{ payment.payment_method }}</td>
                        <td
                          [innerHTML]="
                            payment.payment_proof_url | fileUrl | async
                          "
                        ></td>
                        <td>
                          <p-button
                            text
                            icon="pi pi-print"
                            rounded
                            (onClick)="generatePaymentReceipt(payment)"
                          />
                          <p-button
                            text
                            icon="pi pi-trash"
                            rounded
                            severity="danger"
                            (onClick)="store.reversePayment(payment)"
                          />
                        </td>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                      <tr>
                        <td colspan="6" class="text-center">
                          Sin pagos registrados
                        </td>
                      </tr>
                    </ng-template>
                  </p-table>
                }
              </p-tabpanel>
              <p-tabpanel value="1">
                <p-table
                  [value]="loan.installments"
                  styleClass="p-datatable-striped"
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
                      <td>{{ installment.amount | currency }}</td>
                      <td>{{ installment.paid_amount | currency }}</td>
                      <td>
                        {{ balance | currency }}
                      </td>
                      <td>
                        @switch (isDueDate(installment)) {
                          @case (status.Paid) {
                            <p-tag value="Pagado" severity="success" rounded />
                          }
                          @case (status.Pending) {
                            <p-tag
                              value="Pendiente"
                              severity="secondary"
                              rounded
                            />
                          }
                          @case (status.Overdue) {
                            <p-tag value="Vencido" severity="danger" rounded />
                          }
                        }
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </p-tabpanel>
            </p-tabpanels>
          </p-tabs>
        </p-card>
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
  private docGenerator = inject(DocGeneratorsService);

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

  updateLoanAssignee(id: string) {
    this.store.updateLoanAssignee(Number(this.loanId()), id);
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

  generatePaymentReceipt(payment: Payment) {
    this.docGenerator.printPaymentReceipt(payment, this.store.currentLoan()!);
  }

  printLoan(loan: Loan) {
    this.docGenerator.printLoanReceipt(loan);
  }
}
