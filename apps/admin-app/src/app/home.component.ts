import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DashboardStore } from './stores/dashboard.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CardModule, CurrencyPipe],
  template: `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <p-card header="# Prestamos">
      <div class="text-2xl font-semibold text-slate-700">
        {{ store.loansCount() }}
      </div>
    </p-card>
    <p-card header="Total prestado">
      <div class="flex justify-between">
        <div class="text-2xl font-semibold text-slate-700">
          {{ store.loansSum() | currency }}
        </div>
        <span class="pi pi-money-bill text-3xl "></span>
      </div>
    </p-card>
    <p-card header="Total adeudado">
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
export class HomeComponent {
  protected store = inject(DashboardStore);
}
