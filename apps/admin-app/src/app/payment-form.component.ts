import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PaymentMethod } from '@rappi/models';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { v4 } from 'uuid';
import { SupabaseService } from './services/supabase.service';
import { markGroupAsDirty } from './services/utils';
import { DashboardStore } from './stores/dashboard.store';

@Component({
    selector: 'app-payment-form',
    imports: [
        ReactiveFormsModule,
        InputTextModule,
        InputNumberModule,
        ButtonModule,
        DropdownModule,
        CalendarModule,
        FileUploadModule,
    ],
    template: ` <form [formGroup]="form" (ngSubmit)="saveChanges()">
    <div class="grid md:grid-cols-2 gap-4">
      <div class="input-group">
        <label for="amount">Monto</label>
        <p-inputNumber
          formControlName="amount"
          mode="currency"
          currency="USD"
          x
          locale="es-US"
          id="amount"
        />
      </div>
      <div class="input-group">
        <label for="reference">Referencia</label>
        <input pInputText id="reference" formControlName="reference" />
      </div>
      <div class="input-group">
        <label for="notes">Notas</label>
        <input pInputText id="notes" formControlName="notes" />
      </div>
      <div class="input-group">
        <label for="payment_date">Fecha de pago</label>
        <p-calendar
          id="payment_date"
          showIcon
          iconDisplay="input"
          appendTo="body"
          formControlName="payment_date"
        />
      </div>
      <div class="input-group">
        <label for="payment_method">Metodo de pago</label>
        <p-dropdown
          id="payment_method"
          formControlName="payment_method"
          appendTo="body"
          [options]="methods"
          optionLabel="label"
          optionValue="value"
        />
      </div>
      <div class="input-group">
        <label for="file">Comprobante</label>
        <p-fileUpload
          id="file"
          customUpload
          mode="basic"
          chooseIcon="pi pi-upload"
          uploadLabel="Subir"
          cancelLabel="Cancelar"
          cancelIcon="pi pi-times"
          chooseLabel="Seleccionar"
          (uploadHandler)="uploadFile($event)"
        ></p-fileUpload>
      </div>
    </div>
    <div class="flex justify-end gap-4 mt-4">
      <p-button
        label="Cancelar"
        type="button"
        outlined
        severity="secondary"
        icon="pi pi-times"
        (onClick)="dialogRef.close()"
      />
      <p-button
        label="Guardar"
        type="submit"
        icon="pi pi-check"
        [loading]="store.loading()"
      />
    </div>
  </form>`,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentFormComponent implements OnInit {
  protected methods = [
    { label: 'Efectivo', value: PaymentMethod.Efectivo },
    { label: 'Yappy', value: PaymentMethod.Yappy },
    { label: 'Transferencia', value: PaymentMethod.Transferencia },
  ];

  private toast = inject(MessageService);
  protected store = inject(DashboardStore);
  public dialogRef = inject(DynamicDialogRef);
  private supabase = inject(SupabaseService);

  form = new FormGroup({
    id: new FormControl(v4(), { nonNullable: true }),
    amount: new FormControl(0, {
      validators: [Validators.required, Validators.min(1)],
      nonNullable: true,
    }),
    loan_id: new FormControl<number>(0, { nonNullable: true }),
    reference: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
    payment_method: new FormControl(PaymentMethod.Efectivo, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    payment_date: new FormControl(new Date(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    payment_proof_url: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.form.patchValue({ loan_id: this.store.selectedLoanId()! });
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

    this.store.applyPayment(this.form.getRawValue()).then(() => {
      this.dialogRef.close();
    });
  }

  async uploadFile(event: FileUploadHandlerEvent) {
    const { data, error } = await this.supabase.uploadFile(event.files[0]);
    if (error) {
      this.toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un error al subir el archivo',
      });
      return;
    }
    this.form.patchValue({ payment_proof_url: data.path });
    this.toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Archivo subido correctamente',
    });
  }
}
