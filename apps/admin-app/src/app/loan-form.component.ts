import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Installment, Recurrence } from '@rappi/models';
import { addDays, addMonths, subDays } from 'date-fns';
import { toDate } from 'date-fns-tz';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { v4 } from 'uuid';
import { markGroupAsDirty } from './services/utils';
import { DashboardStore } from './stores/dashboard.store';

@Component({
  selector: 'app-loan-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    CardModule,
    CurrencyPipe,
    CalendarModule,
    TableModule,
    DatePipe,
  ],
  template: `<h1>Nuevo prestamo</h1>
    <form
      class="flex flex-col gap-4"
      [formGroup]="form"
      (ngSubmit)="saveChanges()"
    >
      <p-card subheader="Ingrese los datos del prestamo">
        <ng-template pTemplate="header">
          <div
            class="p-card-title flex justify-between items-center p-5 pb-0 mb-0"
          >
            Datos del prestamo
            <p-button label="Guardar" type="submit" icon="pi pi-save" />
          </div>
        </ng-template>
        <div
          [formGroup]="form"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div class="input-group">
            <label for="client">Cliente</label>
            <p-dropdown
              formControlName="client_id"
              [options]="store.clients()"
              [filter]="true"
              filterBy="first_name,last_name,document_id"
              optionLabel="name"
              optionValue="id"
              placeholder="Seleccione un cliente"
            >
              <ng-template pTemplate="selectedItem" let-selected>
                @if (selected) {
                  <div class="flex items-center justify-between">
                    <div>
                      {{ selected.first_name }} {{ selected.last_name }}
                    </div>
                    <div class="text-sm text-slate-500">
                      {{ selected.document_id }}
                    </div>
                  </div>
                }
              </ng-template>
              <ng-template pTemplate="item" let-client>
                <div class="flex items-center justify-between">
                  <div>{{ client.first_name }} {{ client.last_name }}</div>
                  <div class="text-sm text-slate-500">
                    {{ client.document_id }}
                  </div>
                </div>
              </ng-template>
            </p-dropdown>
          </div>
          <div class="input-group">
            <label for="product">Producto</label>
            <input
              pInputText
              formControlName="product"
              id="product"
              placeholder="Ingrese el producto..."
            />
          </div>
          <div class="input-group">
            <label for="commerce">Comercio</label>
            <input
              pInputText
              formControlName="commerce"
              id="commerce"
              placeholder="Ingrese el comercio..."
            />
          </div>
          <div class="input-group">
            <label for="price_base">Precio base</label>
            <p-inputNumber
              formControlName="price_base"
              mode="currency"
              id="price_base"
              currency="USD"
            />
          </div>
          <div class="input-group">
            <label for="rate">Tasa de interes</label>
            <p-inputNumber formControlName="rate" id="rate" prefix="% " />
          </div>
          <div class="input-group">
            <label for="recurrence">Recurrencia</label>
            <p-dropdown
              formControlName="recurrence_id"
              [options]="recurrences"
              optionLabel="label"
              optionValue="value"
            />
          </div>
          <div class="input-group">
            <label for="installments_count">Cuotas</label>
            <p-inputNumber
              formControlName="installments_count"
              id="installments_count"
            />
          </div>
          <div class="input-group">
            <label for="first_payment_date">Fecha de pago inicial</label>
            <p-calendar
              formControlName="first_payment_date"
              id="first_payment_date"
              appendTo="body"
            />
          </div>
        </div>
      </p-card>
      <p-card header="Terminos del prestamo">
        <div class="flex justify-end"></div>
        <div class="grid grid-cols-4">
          <div class="input-group">
            <label>Total a financiar</label>
            {{ totalAmount() | currency: '$' }}
          </div>
          <div class="input-group">
            <label>Monto cuota</label>
            {{ installmentAmount() | currency: '$' }}
          </div>
        </div>
        <p-table [value]="projectedInstallments()">
          <ng-template pTemplate="header">
            <tr>
              <th>Cuota</th>
              <th>Fecha de pago</th>
              <th>Monto</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-installment>
            <tr>
              <td>{{ installment.seq }}</td>
              <td>{{ installment.due_date | date: 'dd/MM/yyyy' }}</td>
              <td>{{ installment.amount | currency }}</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </form> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanFormComponent implements OnInit {
  form = new FormGroup({
    product: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    price_base: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    commerce: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    client_id: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    rate: new FormControl(50, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    recurrence_id: new FormControl<Recurrence>(Recurrence.Quincenal, {
      validators: [Validators.required],
    }),
    installments_count: new FormControl(1, {
      validators: [Validators.required, Validators.min(1)],
      nonNullable: true,
    }),
    first_payment_date: new FormControl(new Date(), {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  protected readonly store = inject(DashboardStore);
  private readonly toast = inject(MessageService);

  private readonly priceBase = toSignal(
    this.form.controls.price_base.valueChanges,
    {
      initialValue: 0,
    },
  );
  private readonly installments = toSignal(
    this.form.controls.installments_count.valueChanges,
    {
      initialValue: 1,
    },
  );

  readonly rate = toSignal(this.form.controls.rate.valueChanges, {
    initialValue: 50,
  });

  readonly installmentAmount = computed(
    () =>
      Math.round(
        (this.totalAmount() / (this.installments()! ?? 1) + Number.EPSILON) *
          100,
      ) / 100,
  );

  recurrences = [
    { label: 'Quincenal', value: 2 },
    { label: 'Mensual', value: 3 },
  ];

  readonly recurrence = toSignal(
    this.form.controls.recurrence_id.valueChanges,
    {
      initialValue: Recurrence.Quincenal,
    },
  );

  readonly startDate = toSignal(
    this.form.controls.first_payment_date.valueChanges,
    {
      initialValue: new Date(),
    },
  );

  totalAmount = computed(() => this.priceBase() * (1 + this.rate() / 100));
  private injector = inject(Injector);
  private router = inject(Router);
  protected projectedInstallments = signal<Installment[]>([]);

  ngOnInit() {
    effect(
      () => {
        let current = toDate(this.startDate(), {
          timeZone: 'America/Panama',
        });
        this.projectedInstallments.set([]);

        if (!this.installments() || this.installments() === 0) {
          return;
        }

        for (let i = 1; i <= this.installments()!; i++) {
          this.projectedInstallments.update((installments) => [
            ...installments,
            {
              id: v4(),
              seq: i,
              amount: this.installmentAmount(),
              paid_amount: 0,
              due_date: current,
            },
          ]);
          if (this.recurrence() === Recurrence.Mensual) {
            current = addMonths(current, 1);
            return;
          }
          if (this.recurrence() === Recurrence.Quincenal) {
            if (current.getDate() <= 15) {
              current = addDays(current, 15);
            } else {
              current = addMonths(current, 1);
              current = subDays(current, 15);
            }
          }
        }
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  saveChanges() {
    if (this.form.invalid) {
      markGroupAsDirty(this.form);
      this.toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos',
      });

      return;
    }
    const request = {
      ...this.form.getRawValue(),
      installments: this.projectedInstallments(),
    };

    this.store.createLoan(request).then((data) => {
      this.router.navigate(['/loans', data.id]);
    });
  }
}
