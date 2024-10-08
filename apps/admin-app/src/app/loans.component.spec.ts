import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoansComponent } from './loans.component';
import { DashboardStore } from './stores/dashboard.store';

describe('LoansComponent', () => {
  let component: LoansComponent;
  let fixture: ComponentFixture<LoansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        DashboardStore,
        ConfirmationService,
        MessageService,
      ],
      imports: [LoansComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
