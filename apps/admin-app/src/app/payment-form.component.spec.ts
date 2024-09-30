import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PaymentFormComponent } from './payment-form.component';
import { DashboardStore } from './stores/dashboard.store';

describe('PaymentFormComponent', () => {
  let component: PaymentFormComponent;
  let fixture: ComponentFixture<PaymentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        MessageService,
        DashboardStore,
        ConfirmationService,
        DynamicDialogRef,
        provideHttpClient(),
        { provide: DynamicDialogConfig, useValue: { data: {} } },
      ],
      imports: [PaymentFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
