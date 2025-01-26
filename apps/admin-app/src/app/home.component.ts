import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { addDays, format } from 'date-fns';
import { toDate } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { BaseChartDirective } from 'ng2-charts';
import { Card } from 'primeng/card';
import { DashboardStore } from './stores/dashboard.store';

@Component({
  selector: 'app-home',
  imports: [Card, CurrencyPipe, BaseChartDirective],
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
    <div class="lg:col-span-4 md:col-span-2">
      <p-card>
        <ng-template #title>Cobros</ng-template>
        <ng-template #subtitle>Por mes</ng-template>
        <div class="h-[32rem]">
          <canvas
            baseChart
            [data]="barChartData()"
            [options]="barChartOptions"
            [type]="barChartType"
          ></canvas>
        </div>
      </p-card>
    </div>
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  protected store = inject(DashboardStore);
  chart = viewChild.required<BaseChartDirective<'bar'>>(BaseChartDirective);
  monthlyPayments = computed(() =>
    this.store.monthlyPayments().map((p) => ({
      month: format(
        addDays(toDate(p.month, { timeZone: 'America/Panama' }), 1),
        'MMMM yyyy',
        { locale: es },
      ),
      total: p.total_amount,
    })),
  );

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
    },
  };
  public barChartType = 'bar' as const;

  public barChartData = computed<ChartData<'bar'>>(() => ({
    labels: this.monthlyPayments().map((x) => x.month),
    datasets: [
      { data: this.monthlyPayments().map((x) => x.total), label: 'Pagado' },
    ],
  }));

  ngOnInit(): void {
    this.store.fetchMonthlyPayments();
  }
}
