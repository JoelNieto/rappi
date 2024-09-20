import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { v4 } from 'uuid';
import { markGroupAsDirty } from './services/utils';
import { DashboardStore } from './stores/dashboard.store';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
  ],
  template: `
    <p-card header="Datos del cliente">
      <form
        [formGroup]="form"
        (ngSubmit)="saveChanges()"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div class="input-group">
          <label for="first_name">Nombre</label>
          <input
            pInputText
            formControlName="first_name"
            id="first_name"
            placeholder="Ingrese nombres del cliente..."
          />
        </div>
        <div class="input-group">
          <label for="last_name">Apellido</label>
          <input
            pInputText
            formControlName="last_name"
            id="last_name"
            placeholder="Ingrese apellidos del cliente"
          />
        </div>
        <div class="input-group">
          <label for="document_id">Documento</label>
          <input
            pInputText
            formControlName="document_id"
            id="document_id"
            placeholder="Ingrese número de documento"
          />
        </div>
        <div class="input-group">
          <label for="email">Email</label>
          <input
            pInputText
            formControlName="email"
            id="email"
            type="email"
            placeholder="Email de contacto del cliente"
          />
        </div>
        <div class="input-group">
          <label for="address">Dirección</label>
          <input
            pInputText
            formControlName="address"
            id="address"
            placeholder="Direccion del usuario"
          />
        </div>
        <div class="input-group">
          <label for="phone_number">Teléfono</label>
          <input
            pInputText
            formControlName="phone_number"
            id="phone_number"
            type="tel"
            placeholder="Telefono de contacto"
          />
        </div>
        <div class="input-group">
          <label for="work_place">Lugar de trabajo</label>
          <input
            pInputText
            formControlName="work_place"
            id="work_place"
            placeholder="Lugar de trabajo del cliente"
          />
        </div>
        <div class="input-group">
          <label for="salary">Salario</label>
          <p-inputNumber
            formControlName="salary"
            id="salary"
            type="number"
            mode="currency"
            locale="es-US"
            currency="USD"
          />
        </div>
        <div
          class="flex md:flex-row justify-end flex-col gap-2 md:col-span-2 lg:col-span-4"
        >
          <p-button
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            type="button"
            (onClick)="cancel()"
          />
          <p-button
            label="Guardar cambios"
            icon="pi pi-save"
            type="submit"
            [loading]="store.loading()"
          />
        </div></form
    ></p-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFormComponent implements OnInit {
  public clientId = input<string>();
  protected store = inject(DashboardStore);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  form = new FormGroup({
    id: new FormControl(v4(), { nonNullable: true }),
    first_name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    last_name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    document_id: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    address: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    phone_number: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    work_place: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    salary: new FormControl(0, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    notes: new FormControl('', { nonNullable: true }),
  });

  async ngOnInit(): Promise<void> {
    if (this.clientId()) {
      const client = this.store
        .clients()
        .find((client) => client.id === this.clientId());
      if (client) {
        this.form.patchValue(client);
      }
    }
  }

  saveChanges() {
    if (this.form.pristine) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'No hay cambios para guardar',
      });
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      markGroupAsDirty(this.form);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos',
      });

      return;
    }
    if (this.clientId()) {
      this.store.updateClient(this.form.getRawValue()).then((value) => {
        console.log('Client updated', value);
      });
      return;
    }
    this.store.createClient(this.form.getRawValue()).then((value) => {
      console.log('Client created', value);
    });
  }

  cancel() {
    if (this.form.pristine) {
      this.router.navigate(['/clients']);
      return;
    }
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: 'Tienes cambios sin guardar, ¿Estás seguro de cancelar?',
      accept: () => {
        this.router.navigate(['/clients']);
      },
    });
  }
}
