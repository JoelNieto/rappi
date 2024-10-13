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
import { AuthStore } from './auth.store';

type State = {
  loading: boolean;
  payments: Payment[];
  startDate: Date;
  endDate: Date;
  agentId: string | null;
};

const initialState: State = {
  loading: false,
  payments: [],
  startDate: startOfMonth(new Date()),
  endDate: endOfMonth(new Date()),
  agentId: null,
};

export const PaymentsStore = signalStore(
  withState(initialState),
  withComputed(
    (state, supabase = inject(SupabaseService), auth = inject(AuthStore)) => {
      const total = computed(() =>
        state.payments().reduce((acc, payment) => acc + payment.amount, 0),
      );
      const start = computed(() => format(state.startDate(), 'yyyy-MM-dd'));
      const end = computed(() => format(state.endDate(), 'yyyy-MM-dd'));
      const filter = computed(() => ({
        star: state.startDate(),
        end: state.endDate(),
        agentId: state.agentId(),
      }));
      const query = computed(() => {
        let query = state.agentId()
          ? supabase.client
              .from('loan_payments')
              .select(
                '*, loan:loans!inner(*, client:clients(id, first_name, last_name), agent:profiles(id, full_name, username))',
              )
              .gte('payment_date', start())
              .lte('payment_date', end())
              .eq('loans.created_by', state.agentId())
          : supabase.client
              .from('loan_payments')
              .select(
                '*, loan:loans!inner(*, client:clients(id, first_name, last_name), agent:profiles(id, full_name, username))',
              )
              .gte('payment_date', start())
              .lte('payment_date', end());
        if (!auth.isAdmin()) {
          query = query.eq('loans.created_by', auth.user()?.id);
        }
        return query;
      });
      return { total, start, end, filter, query };
    },
  ),
  withMethods((state) => {
    const fetchPayments = rxMethod<typeof state.filter>(
      pipe(
        tap(() => patchState(state, { loading: true })),
        filter(() => !!state.startDate() && !!state.endDate()),
        switchMap(() =>
          from(state.query()).pipe(
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
      patchState(state, { startDate, endDate });
    };

    const updateAgent = (agentId: string | null) => {
      patchState(state, { agentId });
    };
    return { fetchPayments, updateDates, updateAgent };
  }),
  withHooks({
    onInit({ fetchPayments, filter }) {
      fetchPayments(filter);
    },
  }),
);
