import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Payment } from '@rappi/models';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { filter, from, map, pipe, switchMap, tap } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';

type State = {
  loading: boolean;
  payments: Payment[];
  startDate: Date;
  endDate: Date;
};

const initialState: State = {
  loading: false,
  payments: [],
  startDate: startOfMonth(new Date()),
  endDate: endOfMonth(new Date()),
};

export const paymentsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    total: computed(() =>
      state.payments().reduce((acc, payment) => acc + payment.amount, 0),
    ),
    start: computed(() => format(state.startDate(), 'yyyy-MM-dd')),
    end: computed(() => format(state.endDate(), 'yyyy-MM-dd')),
    filter: computed(() => ({ star: state.startDate(), end: state.endDate() })),
  })),
  withMethods((state, supabase = inject(SupabaseService)) => {
    const fetchPayments = rxMethod<typeof state.filter>(
      pipe(
        tap(() => patchState(state, { loading: true })),
        filter(() => !!state.startDate() && !!state.endDate()),
        switchMap(() =>
          from(
            supabase.client
              .from('loan_payments')
              .select('*, loan:loans(*, client:clients(*))')
              .gte('payment_date', state.start())
              .lte('payment_date', state.end()),
          ).pipe(
            map(({ data, error }) => {
              if (error) {
                throw error;
              }
              return data;
            }),
            tapResponse({
              next: (payments) =>
                patchState(state, { payments, loading: false }),
              error: (error) => {
                console.error(error);
              },
              finalize: () => patchState(state, { loading: false }),
            }),
          ),
        ),
      ),
    );

    const updateDates = (startDate: Date, endDate: Date) => {
      console.log({ startDate, endDate });
      patchState(state, { startDate, endDate });
    };
    return { fetchPayments, updateDates };
  }),
  withHooks({
    onInit({ fetchPayments, filter }) {
      fetchPayments(filter);
    },
  }),
);
