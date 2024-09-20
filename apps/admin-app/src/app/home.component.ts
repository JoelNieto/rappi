import { CurrencyPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardModule } from 'primeng/card';
import { from, map } from 'rxjs';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CardModule, CurrencyPipe, JsonPipe],
  template: `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <p-card header="# Prestamos">
      <div class="text-2xl font-semibold text-slate-700">{{ loanCount() }}</div>
    </p-card>
    <p-card header="Total prestado">
      <div class="flex justify-between">
        <div class="text-2xl font-semibold text-slate-700">
          {{ loanSum() | currency }}
        </div>
        <span class="pi pi-money-bill text-3xl "></span>
      </div>
    </p-card>
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private supabase = inject(SupabaseService);
  loanCount = toSignal(
    from(
      this.supabase.client
        .from('loans')
        .select('*', { count: 'exact', head: true }),
    ).pipe(map((response) => response.count)),
    { initialValue: 0 },
  );

  loanSum = toSignal(
    from(this.supabase.client.from('loans').select('price_base.sum()')).pipe(
      map((res) => (res.data ? res.data[0].sum : 0)),
    ),
    { initialValue: 0 },
  );
}
