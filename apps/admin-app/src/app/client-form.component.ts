import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injector,
  input,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import {
  FileUpload,
  FileUploadHandlerEvent,
  FileUploadModule,
} from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { v4 } from 'uuid';
import { SupabaseService } from './services/supabase.service';
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
    FileUploadModule,
    TableModule,
    DatePipe,
    CurrencyPipe,
    RouterLink,
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

        <div class="input-group md:col-span-2 lg:col-span-4">
          <label for="notes">Documentación</label>
          <p-fileUpload
            #fileUpload
            customUpload
            (uploadHandler)="onUpload($event)"
            multiple
            accept="image/*, application/pdf"
            maxFileSize="1000000"
            invalidFileSizeMessageSummary="Archivo muy grande"
            invalidFileSizeMessageDetail="El archivo debe ser menor a 1MB"
          >
            <ng-template pTemplate="toolbar">
              <div class="py-3">
                Arrastre y suelte los archivos aquí para cargarlos.
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="flex flex-col gap-3">
                @for (link of fileLinks(); track $index; let i = $index) {
                  <div class="flex items-center gap-2">
                    <a
                      [href]="link.signedUrl"
                      target="_blank"
                      class="text-blue-500 hover:underline"
                      >{{ link.path }}</a
                    >
                    <p-button
                      severity="danger"
                      icon="pi pi-times"
                      type="button"
                      size="small"
                      (click)="removeFile(i)"
                    />
                  </div>
                }
              </div>

              @if (uploadedFiles().length) {
                <ul>
                  @for (file of uploadedFiles(); track $index) {
                    {{ file.name }} - {{ file.size }} bytes
                  }
                </ul>
              }
            </ng-template>
          </p-fileUpload>
        </div>
        @if (clientId()) {
          <div class="flex flex-col md:col-span-2 lg:col-span-4">
            <div class="flex justify-between items-center">
              <h2>Prestamos</h2>
              <p-button
                label="Nuevo"
                icon="pi pi-plus"
                routerLink="/loans/new"
                [queryParams]="{ clientId: clientId() }"
              />
            </div>
            <p-table
              [value]="store.selectedClient()?.loans ?? []"
              [paginator]="true"
              [rows]="5"
              styleClass="p-datatable-striped"
              [tableStyle]="{ 'min-width': '75rem' }"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th pSortableColumn="id">ID <p-sortIcon field="id" /></th>
                  <th pSortableColumn="commerce">
                    Comercio <p-sortIcon field="commerce" />
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
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-loan>
                <tr>
                  <td>
                    <a routerLink="/loans/{{ loan.id }}" class="link">{{
                      loan.id
                    }}</a>
                  </td>
                  <td>{{ loan.commerce }}</td>
                  <td>{{ loan.created_at | date: 'dd/MM/yyyy' }}</td>
                  <td>
                    {{ loan.price_base | currency: 'USD' : 'symbol' : '1.0-0' }}
                  </td>
                  <td>
                    {{ loan.balance | currency: 'USD' : 'symbol' : '1.0-0' }}
                  </td>
                  <td>{{ loan.agent?.full_name }}</td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        }
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
export class ClientFormComponent implements OnInit, OnDestroy {
  public clientId = input<string>();
  protected store = inject(DashboardStore);
  private injector = inject(Injector);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  protected uploadedFiles = signal<File[]>([]);
  private supabase = inject(SupabaseService);
  protected fileUploader = viewChild.required<FileUpload>('fileUpload');
  private newFilePaths = signal<string[]>([]);
  protected fileLinks = signal<
    { error: string | null; path: string | null; signedUrl: string }[]
  >([]);

  protected form = new FormGroup({
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
      this.store.fetchClient(this.clientId());
      effect(
        () => {
          if (this.store.selectedClient()) {
            this.loadClientInfo();
          }
        },
        { injector: this.injector },
      );
    }
  }

  async loadClientInfo() {
    const client = this.store.selectedClient();
    if (client) {
      this.form.patchValue(client);
      const documents = client?.documents;

      if (documents?.length) {
        const { data: links } = await this.supabase.getFileUrls(
          documents.map((d) => d.path),
        );
        links?.length && this.fileLinks.set(links);
        console.log('Links', links);
      }
    }
  }

  saveChanges() {
    if (this.form.pristine && !this.newFilePaths().length) {
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

    this.store
      .saveClient(this.form.getRawValue(), this.newFilePaths())
      .then((value) => {
        console.log('Client saved', value);
      });
  }

  async onUpload(event: FileUploadHandlerEvent) {
    for (const file of event.files) {
      const { data, error } = await this.supabase.uploadFile(file);
      if (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo subir el archivo',
        });
        return;
      }
      this.uploadedFiles.update((current) => [...current, file]);
      this.newFilePaths.update((current) => [...current, data.path]);

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Archivo subido correctamente',
      });
    }
    this.fileUploader().clear();
  }

  removeFile(index: number) {
    this.uploadedFiles.update((current) =>
      current.filter((_, i) => i !== index),
    );
    this.newFilePaths.update((current) =>
      current.filter((_, i) => i !== index),
    );
    this.fileLinks.update((current) => current.filter((_, i) => i !== index));
  }

  cancel() {
    if (this.fileUploader().hasFiles()) {
      this.confirmationService.confirm({
        header: 'Confirmación',
        message: 'Tienes archivos sin subir, ¿Estás seguro de cancelar?',
        rejectButtonStyleClass: 'p-button-text',
        accept: () => {
          this.router.navigate(['/clients']);
        },
      });
      return;
    }
    if (this.form.pristine && !this.newFilePaths().length) {
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

  ngOnDestroy() {
    this.store.fetchClient(undefined);
  }
}
