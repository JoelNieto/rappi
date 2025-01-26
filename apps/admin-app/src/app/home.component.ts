import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { Card } from 'primeng/card';
import { DashboardStore } from './stores/dashboard.store';

@Component({
  selector: 'app-home',
  imports: [Card, CurrencyPipe],
  template: `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <p-card>
      <ng-template #title> # Prestamos </ng-template>
      <div class="text-2xl font-semibold text-slate-700">
        {{ store.loansCount() }}
      </div>
    </p-card>
    <p-card>
      <ng-template #title>Total prestado</ng-template>
      <div class="flex justify-between">
        <div class="text-2xl font-semibold text-slate-700">
          {{ store.loansSum() | currency }}
        </div>
        <span class="pi pi-money-bill text-3xl "></span>
      </div>
    </p-card>
    <p-card>
      <ng-template #title>Total adeudado</ng-template>
      <div class="flex justify-between">
        <div class="text-2xl font-semibold text-slate-700">
          {{ store.debtSum() | currency }}
        </div>
        <span class="pi pi-money-bill text-3xl "></span>
      </div>
    </p-card>
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  protected store = inject(DashboardStore);

  ngOnInit(): void {
    this.store.fetchMonthlyPayments();
  }
}
